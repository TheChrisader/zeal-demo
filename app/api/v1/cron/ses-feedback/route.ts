import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { updateCampaign } from "@/database/campaign/campaign.repository";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import { connectToDatabase } from "@/lib/database";

// --- TYPE DEFINITIONS ---

interface MessageTag {
  campaign?: string[];
  subscriber?: string[];
  is_direct_user_email?: string[];
}

interface MailHeaders {
  [key: string]: string;
}

interface Mail {
  messageId: string;
  destination: string[];
  timestamp: string;
  source: string;
  headers?: MailHeaders;
  tags?: MessageTag;
}

interface BouncedRecipient {
  emailAddress: string;
  action: string;
  status: string;
  diagnosticCode?: string;
}

interface ComplainedRecipient {
  emailAddress: string;
}

// --- ZOD SCHEMAS FOR VALIDATION ---

const BouncedRecipientSchema = z.object({
  emailAddress: z.string().email("Invalid email address"),
  action: z.string(),
  status: z.string(),
  diagnosticCode: z.string().optional(),
});

const BounceSchema = z.object({
  bounceType: z.enum(["Permanent", "Transient", "Undetermined"]),
  bounceSubType: z.enum(["General", "NoEmail", "Suppressed", "Undetermined"]),
  bouncedRecipients: z.array(BouncedRecipientSchema),
  timestamp: z.string(),
  feedbackId: z.string(),
  reportingMTA: z.string().optional(),
});

const ComplainedRecipientSchema = z.object({
  emailAddress: z.string().email("Invalid email address"),
});

const ComplaintSchema = z.object({
  complaintFeedbackType: z.enum(["abuse", "fraud", "not-spam", "other"]),
  userAgent: z.string().optional(),
  complainedRecipients: z.array(ComplainedRecipientSchema),
  timestamp: z.string(),
  feedbackId: z.string(),
});

const MailSchema = z.object({
  messageId: z.string(),
  destination: z.array(z.string()),
  timestamp: z.string(),
  source: z.string().email(),
  headers: z.record(z.string()).optional(),
  tags: z
    .object({
      campaign: z.array(z.string()).optional(),
      subscriber: z.array(z.string()).optional(),
      is_direct_user_email: z.array(z.string()).optional(),
    })
    .optional(),
});

const SESMessageSchema = z.object({
  notificationType: z.enum(["Bounce", "Complaint"]),
  mail: MailSchema,
  bounce: BounceSchema.optional(),
  complaint: ComplaintSchema.optional(),
});

const SNSMessageSchema = z.object({
  Message: z.string(),
  MessageId: z.string(),
  Signature: z.string(),
  SignatureVersion: z.string(),
  SigningCertURL: z.string(),
  Timestamp: z.string(),
  TopicArn: z.string(),
  Type: z.string(),
  UnsubscribeURL: z.string(),
});

const SQSMessageSchema = z.object({
  MessageId: z.string(),
  ReceiptHandle: z.string(),
  MD5OfBody: z.string(),
  Body: z.string(),
});

// --- CONFIGURATION ---
const SQS_REGION = process.env.SQS_REGION;
const QUEUE_URL = process.env.SES_FEEDBACK_QUEUE_URL;

if (!SQS_REGION || !QUEUE_URL) {
  throw new Error("Missing required SQS configuration");
}

// Initialize SQS Client
const sqs = new SQSClient({
  region: SQS_REGION,
  credentials: {
    accessKeyId: process.env.SQS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY!,
  },
});

// --- HELPER FUNCTIONS ---

function extractCampaignId(mail: Mail): string | null {
  if (
    mail.tags?.campaign &&
    mail.tags.campaign.length > 0 &&
    mail.tags.campaign[0]
  ) {
    return mail.tags.campaign[0];
  }
  return null;
}

async function handlePermanentBounce(
  recipients: BouncedRecipient[],
  campaignId: string | null,
): Promise<void> {
  const updatePromises = recipients.map(async (rcpt) => {
    await SubscriberModel.updateOne(
      { email_address: rcpt.emailAddress },
      {
        global_status: "bounced",
        status_reason: `Permanent bounce: ${rcpt?.diagnosticCode || "Unknown"}`,
        status_updated_at: new Date(),
      },
    );
    console.log(`[Permanent Bounce] ${rcpt.emailAddress}`);
  });

  await Promise.all(updatePromises);

  // Update campaign stats
  if (campaignId && recipients.length > 0) {
    await updateCampaign({ id: campaignId }, { bounced: recipients.length });
  }
}

async function handleTransientBounce(
  recipients: BouncedRecipient[],
): Promise<void> {
  const updatePromises = recipients.map(async (rcpt) => {
    const subscriber = await SubscriberModel.findOne({
      email_address: rcpt.emailAddress,
    });

    const updateData: {
      $inc: { soft_bounce_count: number };
      last_soft_bounce_at: Date;
      global_status?: "bounced";
      status_reason?: string;
      status_updated_at?: Date;
    } = {
      $inc: { soft_bounce_count: 1 },
      last_soft_bounce_at: new Date(),
    };

    // If soft bounce count exceeds threshold (5), mark as bounced
    if (subscriber && subscriber.soft_bounce_count >= 4) {
      updateData.global_status = "bounced";
      updateData.status_reason = "Too many soft bounces";
      updateData.status_updated_at = new Date();
    }

    await SubscriberModel.updateOne(
      { email_address: rcpt.emailAddress },
      updateData,
    );
    console.log(
      `[Transient Bounce] ${rcpt.emailAddress} (count: ${subscriber ? subscriber.soft_bounce_count + 1 : 1})`,
    );
  });

  await Promise.all(updatePromises);
}

async function handleComplaint(
  recipients: ComplainedRecipient[],
  complaintType: string,
  campaignId: string | null,
): Promise<void> {
  const updatePromises = recipients.map(async (rcpt) => {
    await SubscriberModel.updateOne(
      { email_address: rcpt.emailAddress },
      {
        global_status: "complaint",
        status_reason: `Spam complaint: ${complaintType}`,
        status_updated_at: new Date(),
      },
    );
    console.log(`[Complaint] ${rcpt.emailAddress}`);
  });

  await Promise.all(updatePromises);

  // Update campaign stats
  if (campaignId && recipients.length > 0) {
    await updateCampaign({ id: campaignId }, { complained: recipients.length });
  }
}

// --- MAIN HANDLER ---

export async function POST(request: Request) {
  // --- SECURITY CHECK ---
  const { searchParams } = new URL(request.url);
  if (searchParams.get("key") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let processedCount = 0;
  let keepPolling = true;
  const SAFETY_LIMIT = 100; // Stop after 100 messages to prevent timeouts/memory issues

  try {
    await connectToDatabase();
    console.log("Starting SES Bounce/Complaint Processing...");

    // --- DRAIN LOOP ---
    // Keep fetching until queue is empty or limit reached
    while (keepPolling) {
      // Fetch batch of 10 (AWS Max)
      const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 2, // Short wait since we are looping
      });

      const response = await sqs.send(command);

      // If queue is empty, stop the loop
      if (!response.Messages || response.Messages.length === 0) {
        keepPolling = false;
        break;
      }

      // Process the batch
      for (const message of response.Messages) {
        try {
          // --- PARSE LAYERS WITH VALIDATION ---

          // Layer 1: Validate SQS Message
          const sqsMessage = SQSMessageSchema.parse(message);

          // Layer 2: Parse and validate SNS Message Body
          const snsBody = SNSMessageSchema.parse(JSON.parse(sqsMessage.Body));

          // Layer 3: Parse and validate SES Message
          const sesMessage = SESMessageSchema.parse(
            JSON.parse(snsBody.Message),
          );

          const { notificationType, mail, bounce, complaint } = sesMessage;
          const campaignId = extractCampaignId(mail);

          // --- HANDLE BOUNCES ---
          if (notificationType === "Bounce" && bounce) {
            const recipients = bounce.bouncedRecipients;

            if (bounce.bounceType === "Permanent") {
              await handlePermanentBounce(recipients, campaignId);
            } else if (bounce.bounceType === "Transient") {
              await handleTransientBounce(recipients);
            }
          }

          // --- HANDLE COMPLAINTS ---
          if (notificationType === "Complaint" && complaint) {
            await handleComplaint(
              complaint.complainedRecipients,
              complaint.complaintFeedbackType,
              campaignId,
            );
          }

          // --- DELETE MESSAGE ---
          // Critical: If we don't delete, it comes back in 5 mins.
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: sqsMessage.ReceiptHandle,
            }),
          );

          processedCount++;
        } catch (parseError) {
          console.error("Error processing message:", parseError);

          // Try to extract receipt handle for deletion
          const receiptHandle = message.ReceiptHandle;
          if (receiptHandle) {
            try {
              // Delete malformed messages so they don't clog the queue
              await sqs.send(
                new DeleteMessageCommand({
                  QueueUrl: QUEUE_URL,
                  ReceiptHandle: receiptHandle,
                }),
              );
            } catch (deleteError) {
              console.error("Error deleting malformed message:", deleteError);
            }
          }
        }
      }

      // Check Safety Limit
      if (processedCount >= SAFETY_LIMIT) {
        console.log(`Hit safety limit of ${SAFETY_LIMIT}. Stopping run.`);
        keepPolling = false;
      }
    }

    return NextResponse.json({
      status: "Success",
      processed: processedCount,
      message: processedCount === 0 ? "Queue empty" : "Processed batch",
    });
  } catch (error) {
    console.error("Critical SES Feedback Worker Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        processed: processedCount,
      },
      { status: 500 },
    );
  }
}
