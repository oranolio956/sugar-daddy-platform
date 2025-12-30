// Express type declarations for middleware.ts
declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface Request extends IncomingMessage {
    body: any;
    query: any;
    params: any;
    ip: string;
    get(field: string): string | undefined;
    path: string;
    method: string;
    file?: any;
    files?: any;
  }

  export interface Response extends ServerResponse {
    status(code: number): Response;
    json(body: any): Response;
    getHeader(name: string): string | number | string[] | undefined;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Router {
    get(path: string, ...handlers: RequestHandler[]): void;
    post(path: string, ...handlers: RequestHandler[]): void;
    put(path: string, ...handlers: RequestHandler[]): void;
    delete(path: string, ...handlers: RequestHandler[]): void;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void | Promise<void>;
  }

  export function Router(): Router;
  export function json(options?: any): RequestHandler;
  export function urlencoded(options?: any): RequestHandler;
}