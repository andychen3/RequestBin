# RequestBin

## RequestBin Database Setup

A simple TypeScript database service for your RequestBin clone using PostgreSQL + MongoDB.

## Setup

1. `cd` into backend directory.
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (copy `.env.example` to `.env` and fill in your values):
```bash
cp .env.example .env
```

4. Make sure PostgreSQL and MongoDB are running.

4.1. **Create the PostgreSQL database** (MongoDB creates its database automatically):
```bash
createdb requestbin
# If you get a permission error, try: createdb -U <your_username> requestbin
```

   **Note:** If your PostgreSQL user isn't `postgres`, update `PG_USER` in your `.env` file. On macOS with Homebrew, it's usually your system username.

5. Run the test script to verify everything works:
```bash
npm run dbtest
```

6. Start the backend dev server
```bash
npm run dev
```

## Backend API Endpoints

### POST /bins
- Create bin

**Request body**
```json
{
  "bin_route": "abc123",
  "token": "sk_92fj3k1"
}
```

**Response: 201**
```json
{
  "bin_route": "abc123",
  "token": "sk_92fj3k1"
}
```
**Note**
- `bin_route` and `token` are provided by the client and returned as-is.
- Save both bin_route and token as they are needed to view the bin.

**Unsuccessful responses**
- 400 `{"error":"Invalid JSON: "bin_route" and "token" are required fields."}`
- 400 `{"error":"Invalid JSON: "bin_route" and "token" must be strings."}`
- 409 `{"error":"Bin with route <binRoute> already exists."}`

### ALL /in/:binRoute
- Collect webhook request in bin (accepts any method).
  - Replace `:binRoute` with `bin_route` returned from `POST /bins`.

**Response: 204**
- No content

**Unsuccessful responses**
- 404 `{"error":"Bin with route <binRoute> not found."}`

### GET /bins/:binRoute
- Retrieve list of requests in bin
  - Requires header: `Authorization: Bearer <token>`

**Response: 200**
```json
{
  "bin_route": "abc123",
  "requests": [
    {
      "method": "POST",
      "created_at": "2026-03-07 19:12:45",
      "path": "/in/abc123",
      "headers": { "content-type": "application/json" },
      "params": { "category": "webhooks" },
      "body": { "example": true }
    }
  ]
}
```

**Note**
- If a request's body cannot be stored as JSON, it will be returned as a string instead.

**Unsuccessful responses**
- 401 `{"error":"Unauthorized: No token provided"}`
- 401 `{"error":"Unauthorized: Token invalid"}`
- 404 `{"error":"Bin with route <binRoute> not found."}`

### DELETE /bins/:binRoute
- Delete a bin and all requests
  - Requires header: `Authorization: Bearer <token>`

**Response: 204**
- No content

**Unsuccessful responses**
- 401 `{"error":"Unauthorized: No token provided"}`
- 401 `{"error":"Unauthorized: Token invalid"}`
- 404 `{"error":"Bin with route <binRoute> not found."}`
