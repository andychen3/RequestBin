import { pgPool } from './connection.js';

// Bin type
export interface Bin {
  id: string;
  bin_route: string;
  created_at: Date;
  token: string;
}

// Request type (without body - body is in MongoDB)
export interface RequestRecord {
  id: string;
  bin_id: string;
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body_id: string;
  created_at: Date;
}

// Request with body joined from MongoDB
export interface RequestWithBody extends RequestRecord {
  body: unknown;
}

// Create tables if they don't exist
export async function initTables(): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS bins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bin_route VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        token VARCHAR(255) NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bin_id UUID REFERENCES bins(id) ON DELETE CASCADE,
        method VARCHAR(10) NOT NULL,
        parameters JSONB DEFAULT '{}',
        headers JSONB DEFAULT '{}',
        body_id VARCHAR(24) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on bin_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_requests_bin_id ON requests(bin_id)
    `);

    console.log('PostgreSQL tables initialized');
  } finally {
    client.release();
  }
}

// Bin operations
export const binQueries = {
  // Create a new bin
  async create(bin_route: string, token: string): Promise<Bin> {
    const result = await pgPool.query(
      'INSERT INTO bins (bin_route, token) VALUES ($1, $2) RETURNING *',
      [bin_route, token]
    );
    return result.rows[0];
  },

  // Get bin by route
  async getByRoute(bin_route: string): Promise<Bin | null> {
    const result = await pgPool.query('SELECT * FROM bins WHERE bin_route = $1', [
      bin_route,
    ]);
    return result.rows[0] || null;
  },

  // Get bin by ID
  async getById(id: string): Promise<Bin | null> {
    const result = await pgPool.query('SELECT * FROM bins WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  // Delete a bin (cascades to requests)
  async delete(id: string): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM bins WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};

// Request operations
export const requestQueries = {
  // Create a new request
  async create(
    bin_id: string,
    method: string,
    parameters: Record<string, unknown>,
    headers: Record<string, unknown>,
    body_id: string
  ): Promise<RequestRecord> {
    const result = await pgPool.query(
      'INSERT INTO requests (bin_id, method, parameters, headers, body_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [bin_id, method, JSON.stringify(parameters), JSON.stringify(headers), body_id]
    );
    return result.rows[0];
  },

  // Get all requests for a bin
  async getByBinId(bin_id: string): Promise<RequestRecord[]> {
    const result = await pgPool.query(
      'SELECT * FROM requests WHERE bin_id = $1 ORDER BY created_at DESC',
      [bin_id]
    );
    return result.rows;
  },

  // Get a single request by ID
  async getById(id: string): Promise<RequestRecord | null> {
    const result = await pgPool.query('SELECT * FROM requests WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  // Delete a request
  async delete(id: string): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM requests WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },

  // Delete all requests for a bin
  async deleteByBinId(bin_id: string): Promise<number> {
    const result = await pgPool.query('DELETE FROM requests WHERE bin_id = $1', [
      bin_id,
    ]);
    return result.rowCount ?? 0;
  },
};
