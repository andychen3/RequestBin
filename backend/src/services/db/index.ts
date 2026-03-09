import 'dotenv/config';
import { BodyModel } from './models.js';
import {
  initTables,
  binQueries,
  requestQueries,
  Bin,
  RequestRecord,
  RequestWithBody,
} from './postgres.js';
import {
  initDatabases,
  closeDatabases,
  pgPool,
} from './connection.js';

// Request data type for creating requests
export interface RequestData {
  method: string;
  parameters: Record<string, unknown>;
  headers: Record<string, unknown>;
  body: unknown;
}

// Re-export types for convenience
export type { Bin, RequestRecord, RequestWithBody };

// Main database service
const db = {
  // Initialize databases and tables
  async init(): Promise<void> {
    await initDatabases();
    await initTables();
  },

  // Close all connections
  async close(): Promise<void> {
    await closeDatabases();
  },

  // Bin operations
  bins: {
    // Create a new bin
    async create(bin_route: string, token: string): Promise<Bin> {
      return binQueries.create(bin_route, token);
    },

    // Get bin by route (e.g., "abc123")
    async getByRoute(bin_route: string): Promise<Bin | null> {
      return binQueries.getByRoute(bin_route);
    },

    // Get bin by ID
    async getById(id: string): Promise<Bin | null> {
      return binQueries.getById(id);
    },

    // Delete a bin and all its requests
    async delete(id: string): Promise<boolean> {
      return binQueries.delete(id);
    },
  },

  // Request operations
  requests: {
    // Create a new request with body
    async create(bin_id: string, data: RequestData): Promise<RequestWithBody> {
      // First, save body to MongoDB
      const bodyDoc = await BodyModel.create({ body: data.body });
      const body_id = bodyDoc._id.toString();

      // Then, save request to PostgreSQL with body_id reference
      const request = await requestQueries.create(
        bin_id,
        data.method,
        data.parameters,
        data.headers,
        body_id
      );

      // Return combined record
      return {
        ...request,
        body: data.body,
      };
    },

    // Get all requests for a bin (with bodies)
    async getByBinId(bin_id: string): Promise<RequestWithBody[]> {
      const requests = await requestQueries.getByBinId(bin_id);

      // Fetch all bodies from MongoDB in parallel
      const requestsWithBodies = await Promise.all(
        requests.map(async (req) => {
          const bodyDoc = await BodyModel.findById(req.body_id).lean();
          return {
            ...req,
            body: bodyDoc?.body ?? null,
          };
        })
      );

      return requestsWithBodies;
    },

    // Get a single request by ID (with body)
    async getById(id: string): Promise<RequestWithBody | null> {
      const request = await requestQueries.getById(id);
      if (!request) return null;

      const bodyDoc = await BodyModel.findById(request.body_id).lean();
      return {
        ...request,
        body: bodyDoc?.body ?? null,
      };
    },

    // Get all requests for a bin by its route (convenience method)
    async getByBinRoute(bin_route: string): Promise<RequestWithBody[]> {
      const bin = await binQueries.getByRoute(bin_route);
      if (!bin) return [];
      return this.getByBinId(bin.id);
    },

    // Delete a request (and its body from MongoDB)
    async delete(id: string): Promise<boolean> {
      const request = await requestQueries.getById(id);
      if (!request) return false;

      // Delete body from MongoDB
      await BodyModel.findByIdAndDelete(request.body_id);

      // Delete request from PostgreSQL
      return requestQueries.delete(id);
    },
  },

  // Raw pool access (if needed for custom queries)
  pgPool,
};

// Default export
export default db;
