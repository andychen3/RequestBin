import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import { WebSocket } from 'ws';
import { ApiError } from './errors.js';
import { createBin, deleteBin } from './services/bins.js';
import { saveRequestToBin, getRequestsInBin } from './services/requests.js';

const app = express();

app.use(cors());

const captureRaw = (req: Request, res: any, buf: Buffer) => {
  req.rawBodyBuffer = buf;
  req.rawBodyText = buf.toString();
};

app.use(express.json({ verify: captureRaw }));
app.use(express.urlencoded({ extended: true, verify: captureRaw }));
app.use(express.text({ verify: captureRaw }));
app.use(express.raw({ type: '*/*', verify: captureRaw }));

// create bin
app.post('/bins', async (req: Request, res: Response) => {
  const { bin_route } = req.body ?? {};

  const createBinResponse = await createBin(bin_route);
  res.status(201).json(createBinResponse);
});

// collect webhook request into bin
// broadcast to websocket subscribers
app.all('/in/:binRoute', async (req: Request< { binRoute: string }>, res: Response) => {
  const binRoute = req.params.binRoute;

  const savedRequest = await saveRequestToBin(binRoute, req);

  const sockets = req.app.ws?.subscriptions.get(binRoute);
  if (sockets && sockets.size > 0) {
    const message = JSON.stringify({
      bin_route: binRoute,
      request: savedRequest
    });

    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      } else {
        sockets.delete(ws);
      }
    }
  }

  res.sendStatus(204);
});

// view bin + list requests
app.get('/bins/:binRoute', async (req, res) => {
  const binRoute = req.params.binRoute;

  const getBinResponse = await getRequestsInBin(binRoute, req);
  res.status(200).json(getBinResponse);
});

// delete bin and its requests
app.delete('/bins/:binRoute', async (req, res) => {
  const binRoute = req.params.binRoute;

  await deleteBin(binRoute, req);
  res.sendStatus(204);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal server error" });
});

export default app;
