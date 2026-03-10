
import app from './app.js';
import db from './services/db/index.js';

const PORT = 3000;

await db.init();

const server = app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
});

const shutdown = async (): Promise<void> => {
  server.close();
  await db.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
