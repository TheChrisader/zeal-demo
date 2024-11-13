import { PushSubscription } from "web-push";
import { EventEmitter } from "events";
import { webPush } from "./web-push";

interface Connection {
  writer: WritableStreamDefaultWriter;
  lastPing: number;
  pushSubscription: PushSubscription | null;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, Connection>;
  private events: EventEmitter;
  private readonly HEARTBEAT_INTERVAL = 30000;
  private readonly CONNECTION_TIMEOUT = 60000;

  constructor() {
    this.connections = new Map();
    this.events = new EventEmitter();
    // setInterval(() => this.checkHeartbeats(), this.HEARTBEAT_INTERVAL);
  }

  static getInstance() {
    if (!ConnectionManager.instance) {
      console.log("hehe boii");
      ConnectionManager.instance = new ConnectionManager();
    }
    console.log("no hehe boii");
    return ConnectionManager.instance;
  }

  async addConnection(userId: string, writer: WritableStreamDefaultWriter) {
    this.connections.set(userId, {
      writer,
      lastPing: Date.now(),
      pushSubscription: null,
    });
    console.log(this.connections.size);
    console.log(`Connection added for user ${userId}`);
  }

  async addPushSubscription(userId: string, subscription: PushSubscription) {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.pushSubscription = subscription;
      console.log(`Push subscription added for user ${userId}`);
    }
  }

  async removeConnection(userId: string) {
    const connection = this.connections.get(userId);
    if (connection && !connection.writer.closed) {
      await connection.writer.close();
      this.connections.delete(userId);
      console.log(`Connection removed for user ${userId}`);
    }
  }

  private async checkHeartbeats() {
    const now = Date.now();
    for (const [userId, connection] of this.connections.entries()) {
      if (now - connection.lastPing > this.CONNECTION_TIMEOUT) {
        console.log(`Connection timeout for user ${userId}`);
        await this.removeConnection(userId);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendNotification(userId: string, notification: any) {
    console.log(this.connections.size);
    const connection = this.connections.get(userId);
    if (connection) {
      const encoder = new TextEncoder();
      try {
        await connection.writer.write(
          encoder.encode(`data: ${JSON.stringify(notification)}\n\n`),
        );
        connection.lastPing = Date.now();

        if (connection.pushSubscription) {
          await webPush.sendNotification(
            connection.pushSubscription,
            JSON.stringify(notification),
          );
        }
      } catch (error) {
        console.error(`Error sending notification to user ${userId}: `, error);
        await this.removeConnection(userId);
      }
    }
  }
}
