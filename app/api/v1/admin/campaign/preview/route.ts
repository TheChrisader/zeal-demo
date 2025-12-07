import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { connectToDatabase } from "@/lib/database";
import { CampaignTemplates } from "@/types/campaign.type";
import {
  CustomDataSnapshot,
  StandardDataSnapshot,
} from "@/types/newsletter.type";
import { ZealCustomBroadcast } from "@/utils/email/templates/CustomBroadcast";
import ZealNewsletterCampaign from "@/utils/email/templates/NewsletterCampaign";
import { prepareCampaignView } from "@/utils/newsletter.utils";

const CampaignPreviewRequestSchema = z
  .object({
    template_id: z.enum(CampaignTemplates).default("standard"),
    article_ids: z.array(z.string()).optional(),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Subject too long"),
    preheader: z.string().max(500, "Preheader too long"),
    body_content: z.string().max(50000, "Body content too long").optional(),
  })
  .refine(
    (data) => {
      if (data.template_id === "standard" && !data.article_ids?.length) {
        return false;
      }
      if (data.template_id === "custom" && !data.body_content?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Template-specific content requirements not met",
      path: ["template_id"],
    },
  );

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { template_id, article_ids, subject, preheader, body_content } =
      CampaignPreviewRequestSchema.parse(body);
    await connectToDatabase();

    let html: string;

    if (template_id === "standard") {
      // Standard template with articles
      const { articles } = await prepareCampaignView(article_ids!, false, null);

      const viewModel: StandardDataSnapshot = {
        articles,
        meta: {
          subject: subject || "Subject Placeholder",
          preheader: preheader || "Preheader Placeholder",
          unsubscribeUrl: "#",
        },
      };

      html = await render(ZealNewsletterCampaign(viewModel));
      console.log(
        await render(ZealNewsletterCampaign(viewModel), { plainText: true }),
      );
    } else {
      const viewModel: CustomDataSnapshot = {
        bodyContent: body_content || "",
        meta: {
          subject: subject || "Subject Placeholder",
          preheader: preheader || "Preheader Placeholder",
          unsubscribeUrl: "#",
        },
      };
      // Custom template with body content
      html = await render(ZealCustomBroadcast(viewModel));
    }

    return NextResponse.json({
      html,
      template_id,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: error.errors,
        },
        { status: 422 },
      );
    }
    console.error("Error generating preview:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
};
