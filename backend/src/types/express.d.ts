import 'express';

declare module 'express' {
  interface Request {
    /** raw request body captured before parsing */
    rawBody?: string;
  }
}