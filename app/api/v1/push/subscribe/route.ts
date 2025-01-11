import {
  createSubscription,
  findSubscriptionByEndpoint,
  updateSubscription,
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

    const savedSubscription = await findSubscriptionByEndpoint(
      subscription.endpoint,
    );

    if (savedSubscription) {
      if (savedSubscription.user_id?.toString() !== user.id.toString()) {
        await updateSubscription({
          endpoint: savedSubscription.endpoint,
          data: { user_id: user.id.toString() },
        });
      }

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
