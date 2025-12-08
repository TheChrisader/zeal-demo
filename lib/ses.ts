import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";

const config = {
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY as string,
  },
  region: process.env.SES_REGION as string,
  // apiVersion: process.env.BUCKET_POLICY_VERSION as string,
};

const client = new SESv2Client(config);

export { SendEmailCommand };

export default client;
