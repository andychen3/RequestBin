import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors.js';
import { createBin } from './services/bins.js';
import { saveRequestToBin, getRequestsInBin } from './services/requests.js';

const app = express();

app.use(cors());

const captureRaw = (req: Request, res: any, buf: Buffer) => {
  req.rawBody = buf.toString();
};

app.use(express.json({ verify: captureRaw }));
app.use(express.urlencoded({ extended: true, verify: captureRaw }));
app.use(express.text({ verify: captureRaw }));
app.use(express.raw({ type: '*/*', verify: captureRaw }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal server error" });
});

// create bin
app.post('/bins', async (req: Request, res: Response) => {
    const createBinResponse = await createBin();
    res.status(201).json(createBinResponse);
});

// collect webhook request into bin
app.all('/in/:binRoute', async (req: Request< { binRoute: string }>, res: Response) => {
  const binRoute = req.params.binRoute;

  await saveRequestToBin(binRoute, req);
  res.sendStatus(204);
});

// view bin + list requests
app.get('/bins/:binRoute', async (req, res) => {
  const binRoute = req.params.binRoute;

  const getBinResponse = await getRequestsInBin(binRoute, req);
  res.status(200).json(getBinResponse);
});

app.delete('/bins/:binRoute', async (req, res) => {

});

export default app;