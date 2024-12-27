import {
  createSubscription,
  findSubscriptionByEndpoint,
} from "@/database/subscription/subscription.repository";
import { validateRequest } from "@/lib/auth/auth";
import connectionManager, { ConnectionManager } from "@/lib/connection-manager";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorised" }, { status: 401 });
    }

    const subscription = await request.json();

    // await connectionManager.addPushSubscription(
    //   user.id.toString(),
    //   subscription,
    // );

    console.log("try");

    if (await findSubscriptionByEndpoint(subscription.endpoint)) {
      return Response.json({ success: true });
    }

    console.log("to");

    await createSubscription({ subscription, user_id: user.id.toString() });

    console.log("subscribe");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to subscribe: ", error);
    return Response.json({ error: "Subscription failed." });
  }
}
