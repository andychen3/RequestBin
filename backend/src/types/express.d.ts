import 'express';
import type { WebSocketServer, WebSocket } from "ws"

declare module 'express-serve-static-core' {
  interface Application {
    ws: {
      server: WebSocketServer,
      subscriptions: Map<string, Set<WebSocket>>
    }
  }

  interface Request {
    rawBodyText?: string;
    rawBodyBuffer?: Buffer;
  }
}
