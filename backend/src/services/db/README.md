# RequestBin Database Service

A simple TypeScript database service for your RequestBin clone using PostgreSQL + MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy `.env.example` to `.env` and fill in your values):
```bash
cp .env.example .env
```

3. Make sure PostgreSQL and MongoDB are running.

4. **Create the PostgreSQL database** (MongoDB creates its database automatically):
```bash
createdb requestbin
# If you get a permission error, try: createdb -U <your_username> requestbin
```

   **Note:** If your PostgreSQL user isn't `postgres`, update `PG_USER` in your `.env` file. On macOS with Homebrew, it's usually your system username.

5. Run the test script to verify everything works:
```bash
npm run dbtest
```

## Usage

```typescript
import db from './src/services/db/index.js';

// Initialize connections and create tables
await db.init();

// Create a bin
const bin = await db.bins.create('abc123', 'secret-token-xyz');

// Create a request (body goes to MongoDB, rest goes to Postgres)
const request = await db.requests.create(bin.id, {
  method: 'POST',
  parameters: { foo: 'bar' },              // query parameters
  headers: { 'content-type': 'application/json' },  // headers
  body: { message: 'Hello!' }               // body (stored in MongoDB)
});

// Get all requests for a bin (bodies automatically fetched from MongoDB)
const requests = await db.requests.getByBinId(bin.id);

// Clean up
await db.close();
```

## API Reference

### `db.init()`
Connects to both databases and creates tables if they don't exist.

### `db.close()`
Closes all database connections.

### `db.bins`

#### `create(bin_route: string, token: string): Promise<Bin>`
Creates a new bin with the given route and token.

#### `getByRoute(bin_route: string): Promise<Bin | null>`
Gets a bin by its route (e.g., "abc123").

#### `getById(id: string): Promise<Bin | null>`
Gets a bin by its UUID.

#### `delete(id: string): Promise<boolean>`
Deletes a bin and all its requests (cascades in Postgres).

### `db.requests`

#### `create(bin_id, data: RequestData): Promise<RequestWithBody>`
Creates a new request. The body is stored in MongoDB, everything else in PostgreSQL.

`RequestData` interface:
```typescript
interface RequestData {
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body: unknown;
}
```

#### `getByBinId(bin_id: string): Promise<RequestWithBody[]>`
Gets all requests for a bin by its ID, automatically fetching bodies from MongoDB.

#### `getByBinRoute(bin_route: string): Promise<RequestWithBody[]>`
Gets all requests for a bin by its route (e.g., "abc123"). Returns empty array if bin not found.

#### `getById(id: string): Promise<RequestWithBody | null>`
Gets a single request by ID with its body.

#### `delete(id: string): Promise<boolean>`
Deletes a request and its body from MongoDB.

## Data Flow

1. **Creating a request**: Body → MongoDB → get `body_id` → Rest → PostgreSQL with `body_id`
2. **Reading requests**: Fetch from PostgreSQL → Use `body_id` to fetch from MongoDB → Combine
3. **Deleting**: Delete from PostgreSQL → Delete body from MongoDB by `body_id`

## Troubleshooting

### `role "postgres" does not exist`
Update `PG_USER` in your `.env` to match your system username (run `whoami` to find it).

### `database "requestbin" does not exist`
Run `createdb requestbin` to create the database.

### MongoDB authentication errors
Make sure your `MONGODB_URI` includes credentials if your MongoDB requires auth:
```
MONGODB_URI=mongodb://username:password@localhost:27017/requestbin
```

### Test fails with "duplicate key value"
The previous test run didn't clean up. Reset the database:
```bash
dropdb requestbin && createdb requestbin
```

## Types

```typescript
interface Bin {
  id: string;
  bin_route: string;
  created_at: Date;
  token: string;
}

interface RequestData {
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body: unknown;
}

interface RequestWithBody {
  id: string;
  bin_id: string;
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body_id: string;
  created_at: Date;
  body: unknown;  // from MongoDB
}
```
