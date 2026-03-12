
import app from './app.js';
import db from './services/db/index.js';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3000;

await db.init();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const subscriptions = new Map<string, Set<WebSocket>>();

app.ws = {
  server: wss,
  subscriptions,
}

app.ws.server.on("connection", (ws) => {
  console.log("client connected")

  ws.on("message", (data) => {
    const binRoute = data.toString()

    const set = app.ws.subscriptions.get(binRoute) ?? new Set()

    set.add(ws)
    app.ws.subscriptions.set(binRoute, set)
  })

  ws.on("close", () => {
    for (const set of app.ws.subscriptions.values()) {
      set.delete(ws)
    }
    console.log('client disconnected');
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
})

const shutdown = async (): Promise<void> => {
  wss.close();
  server.close();
  await db.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
