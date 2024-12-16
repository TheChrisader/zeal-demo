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
    // const connectionManager = ConnectionManager.getInstance();
    await connectionManager.addPushSubscription(
      user.id.toString(),
      subscription,
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to subscribe: ", error);
    return Response.json({ error: "Subscription failed." });
  }
}
