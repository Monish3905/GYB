import { IdempotencyManager } from '@payment-os/idempotency';
import { TokenBucketRateLimiter } from '@payment-os/rate-limiter';

export interface ApiRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  ip: string;
}

export interface ApiResponse {
  statusCode: number;
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: string;
    traceId: string;
  };
  metadata: {
    requestId: string;
    correlationId: string;
    timestamp: Date;
  };
}

export type RouteHandler = (req: ApiRequest) => Promise<any>;

export class ApiGateway {
  private routes: Map<string, RouteHandler> = new Map();
  private idempotency = new IdempotencyManager();
  // 100 requests per second per IP
  private rateLimiter = new TokenBucketRateLimiter(100, 10);

  public registerRoute(path: string, method: string, handler: RouteHandler) {
    this.routes.set(`${method} ${path}`, handler);
  }

  public async handleRequest(req: ApiRequest): Promise<ApiResponse> {
    const requestId = crypto.randomUUID();
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    const timestamp = new Date();

    const metadata = { requestId, correlationId, timestamp };

    // 1. Rate Limiting
    const allowed = await this.rateLimiter.consume(req.ip, 1);
    if (!allowed) {
      return {
        statusCode: 429,
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests', traceId: requestId },
        metadata
      };
    }

    // 2. Auth (Mocked for milestone)
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return {
        statusCode: 401,
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing API Key', traceId: requestId },
        metadata
      };
    }

    // 3. Idempotency Check
    const idempotencyKey = req.headers['idempotency-key'];
    if (idempotencyKey) {
      const acquired = await this.idempotency.acquire(idempotencyKey);
      if (!acquired) {
        try {
          const cachedResponse = await this.idempotency.getResponse(idempotencyKey);
          if (cachedResponse) return cachedResponse;
          
          return {
            statusCode: 409,
            success: false,
            error: { code: 'CONCURRENT_REQUEST', message: 'Request in progress', traceId: requestId },
            metadata
          };
        } catch (e) {
          // Fall through
        }
      }
    }

    // 4. Routing
    const handler = this.routes.get(`${req.method} ${req.path}`);
    if (!handler) {
      if (idempotencyKey) await this.idempotency.fail(idempotencyKey);
      return {
        statusCode: 404,
        success: false,
        error: { code: 'NOT_FOUND', message: 'Route not found', traceId: requestId },
        metadata
      };
    }

    // 5. Execution
    try {
      const data = await handler(req);
      const response: ApiResponse = { statusCode: 200, success: true, data, metadata };
      
      if (idempotencyKey) {
        await this.idempotency.complete(idempotencyKey, response);
      }
      return response;
    } catch (err: any) {
      if (idempotencyKey) await this.idempotency.fail(idempotencyKey);
      return {
        statusCode: 500,
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message, traceId: requestId },
        metadata
      };
    }
  }
}
