import { PushSubscription } from "web-push";
import { EventEmitter } from "events";
import { webPush } from "./web-push";

interface Connection {
  writer: WritableStreamDefaultWriter;
  lastPing: number;
  pushSubscription: PushSubscription | null;
}

interface NotificationPayload {
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, Connection>;
  private events: EventEmitter;
  private readonly HEARTBEAT_INTERVAL = 60000;
  private readonly CONNECTION_TIMEOUT = 90000;
  private heartbeatInterval: NodeJS.Timeout | null;

  constructor() {
    this.connections = new Map();
    this.events = new EventEmitter();
    this.heartbeatInterval = null;
    this.startHeartbeat();
    // setInterval(() => this.checkHeartbeats(), this.HEARTBEAT_INTERVAL);
  }

  private startHeartbeat(): void {
    if (!this.heartbeatInterval) {
      this.heartbeatInterval = setInterval(
        () => this.checkHeartbeats(),
        this.HEARTBEAT_INTERVAL,
      );
    }
  }

  static getInstance() {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  async addConnection(userId: string, writer: WritableStreamDefaultWriter) {
    const subscription = this.connections.get(userId)?.pushSubscription || null;
    this.connections.set(userId, {
      writer,
      lastPing: Date.now(),
      pushSubscription: subscription,
    });
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
    try {
      const connection = this.connections.get(userId);
      if (connection) {
        if (!connection.writer.closed) {
          await connection.writer.close();
        }
        this.connections.delete(userId);
        // this.events.emit('connection:removed', userId);
        console.log(`Connection removed for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error removing connection for user ${userId}:`, error);
      this.connections.delete(userId);
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
    console.log("Heartbeat checked.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendNotification(userId: string, notification: any) {
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
        throw error;
      }
    }
  }

  public updatePing(userId: string): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.lastPing = Date.now();
      console.log(`Ping received from user ${userId}`);
    } else {
      console.warn(
        `Ping received for non-existent connection (user: ${userId})`,
      );
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var connectionManager: ConnectionManager | undefined;
}

const connectionManager =
  global.connectionManager || ConnectionManager.getInstance();

if (process.env.NODE_ENV !== "production")
  global.connectionManager = connectionManager;

export default connectionManager;
