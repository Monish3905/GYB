import { ApiGateway, ApiRequest } from '@payment-os/api-gateway';
import { RestRouter } from '@payment-os/rest-api';

export class ApiStressTester {
  public async runApiLoad(requestCount: number): Promise<void> {
    console.log(`\n=== API Gateway Stress Test: ${requestCount.toLocaleString()} requests ===`);

    const gateway = new ApiGateway();
    RestRouter.configureRoutes(gateway);
    
    let success = 0, rateLimited = 429, notFound = 404, internalError = 500, unauthorized = 401, concurrent = 409;
    const stats: Record<number, number> = {};
    const latencies: number[] = [];
    const startTotal = Date.now();

    for (let i = 0; i < requestCount; i++) {
      const start = Date.now();

      // Simulate a mix of API requests including MS15 Provider Layer
      const rand = Math.random();
      const method = 'POST';
      let path = '/v1/payments';
      
      if (rand > 0.95) path = '/v1/providers/quotes';
      else if (rand > 0.90) path = '/v1/providers/health';
      else if (rand > 0.85) path = '/v1/business/merchants';
      else if (rand > 0.75) path = '/v1/business/invoices';
      else if (rand > 0.65) path = '/v1/business/wallets';
      else if (rand > 0.55) path = '/v1/business/payouts';
      else if (rand > 0.45) path = '/v1/customers';
      else if (rand > 0.35) path = `/v1/payments/${crypto.randomUUID()}`;
      else if (rand > 0.98) path = '/v1/not-found';
      
      const ip = `192.168.1.${i % 10}`; // 10 distinct IPs to test rate limiting

      const request: ApiRequest = {
        method,
        path,
        headers: {
          'x-api-key': rand > 0.05 ? 'sk_live_123456789' : '', // 5% missing auth
          'x-correlation-id': `corr-${i}`,
          'idempotency-key': rand > 0.98 ? `idem-${i % 100}` : `idem-${i}` // 2% idempotent replays
        },
        ip
      };

      const response = await gateway.handleRequest(request);

      const latencyMs = Date.now() - start;
      latencies.push(latencyMs);

      stats[response.statusCode] = (stats[response.statusCode] || 0) + 1;
    }

    const totalMs = Date.now() - startTotal;
    latencies.sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.50)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const avgMs = latencies.reduce((s, v) => s + v, 0) / latencies.length;

    console.log('\n--- Results ---');
    console.log(`Total requests    : ${requestCount.toLocaleString()}`);
    console.log(`Total duration    : ${totalMs}ms`);
    console.log(`Throughput        : ${Math.round(requestCount / (totalMs / 1000))} req/sec`);
    console.log(`\n--- Status Codes ---`);
    for (const [code, count] of Object.entries(stats)) {
      console.log(`HTTP ${code}          : ${count} (${((count / requestCount) * 100).toFixed(1)}%)`);
    }
    console.log(`\n--- Latency ---`);
    console.log(`P50               : ${p50}ms`);
    console.log(`P95               : ${p95}ms`);
    console.log(`P99               : ${p99}ms`);
    console.log(`Avg               : ${avgMs.toFixed(2)}ms`);
  }
}
