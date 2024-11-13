import webPush from "web-push";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error(
    "Please define the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables inside .env.local",
  );
}

webPush.setVapidDetails(
  // TODO
  "https://example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export { webPush };
