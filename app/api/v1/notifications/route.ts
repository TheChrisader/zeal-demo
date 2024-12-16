import { validateRequest } from "@/lib/auth/auth";
import connectionManager, { ConnectionManager } from "@/lib/connection-manager";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    const initialMessage = {
      type: "connection",
      message: "Connected successfully",
    };

    (async () => {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`),
      );
    })();

    // if (!process.env.NODE_ENV?.startsWith("dev")) {
    //   const clients = new Map();
    //   clients.set(user.id, writer);

    //   const cleanup = () => {
    //     clients.delete(user.id);
    //     writer.close();
    //   };

    //   const response = new Response(stream.readable, {
    //     headers: {
    //       "Content-Type": "text/event-stream",
    //       "Cache-Control": "no-cache, no-transform",
    //       Connection: "keep-alive",
    //     },
    //   });

    //

    // const connectionManager = ConnectionManager.getInstance();
    console.log("22222222222222222");
    await connectionManager.addConnection(user.id.toString(), writer);
    console.log("22222222222222222");

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    //

    // response.socket?.on("close", async () => {
    //   await connectionManager.removeConnection(user.id.toString());
    // });

    return response;
    // }

    // return new Response(stream.readable, {
    //   headers: {
    //     "Content-Type": "text/event-stream",
    //     "Cache-Control": "no-cache, no-transform",
    //     Connection: "keep-alive",
    //   },
    // });
  } catch (error) {
    return new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}
