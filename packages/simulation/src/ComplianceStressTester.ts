import { ComplianceGateway } from '@payment-os/compliance';

export class ComplianceStressTester {
  public async runComplianceLoad(evaluationCount: number): Promise<void> {
    console.log(`\n=== Compliance Stress Test: ${evaluationCount.toLocaleString()} evaluations ===`);

    const gateway = new ComplianceGateway();
    
    let approved = 0, rejected = 0, manualReview = 0;
    const latencies: number[] = [];
    const startTotal = Date.now();

    for (let i = 0; i < evaluationCount; i++) {
      const start = Date.now();

      // Simulate diverse payment patterns
      const amount = 1000 + Math.random() * 99000;
      // 5% structuring, 2% high risk country, 0.1% sanctions
      const senderCountry = Math.random() < 0.02 ? 'HIGH_RISK_COUNTRY' : 'US';
      const senderName = Math.random() < 0.001 ? 'SANCTIONED_ENTITY' : `Customer ${i}`;

      const decision = await gateway.evaluate({
        paymentId: `pay-${i}`,
        customerId: `cust-${i % 1000}`, // 1000 unique customers cycling
        amount,
        currency: 'USD',
        senderCountry,
        receiverCountry: 'GB',
        senderName,
        deviceIp: `10.0.${Math.floor(i / 255)}.${i % 255}`,
        correlationId: `corr-${i}`
      });

      const latencyMs = Date.now() - start;
      latencies.push(latencyMs);

      if (decision.decision === 'APPROVED') approved++;
      else if (decision.decision === 'REJECTED') rejected++;
      else manualReview++;
    }

    const totalMs = Date.now() - startTotal;
    latencies.sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.50)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const avgMs = latencies.reduce((s, v) => s + v, 0) / latencies.length;

    console.log('\n--- Results ---');
    console.log(`Total evaluations : ${evaluationCount.toLocaleString()}`);
    console.log(`Total duration    : ${totalMs}ms`);
    console.log(`Throughput        : ${Math.round(evaluationCount / (totalMs / 1000))} eval/sec`);
    console.log(`\n--- Decisions ---`);
    console.log(`Approved          : ${approved} (${((approved / evaluationCount) * 100).toFixed(1)}%)`);
    console.log(`Rejected          : ${rejected} (${((rejected / evaluationCount) * 100).toFixed(1)}%)`);
    console.log(`Manual Review     : ${manualReview} (${((manualReview / evaluationCount) * 100).toFixed(1)}%)`);
    console.log(`\n--- Latency ---`);
    console.log(`P50               : ${p50}ms`);
    console.log(`P95               : ${p95}ms`);
    console.log(`P99               : ${p99}ms`);
    console.log(`Avg               : ${avgMs.toFixed(2)}ms`);
  }
}
