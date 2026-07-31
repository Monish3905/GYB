import { IEventBus } from '@payment-os/event-bus';
import { VelocityEngine } from '@payment-os/velocity-engine';

export interface AmlAlert {
  alertId: string;
  riskScore: number;
  evidence: string[];
  triggeredRules: string[];
  timestamp: Date;
  correlationId: string;
}

export class AmlEngine {
  constructor(
    private bus: IEventBus,
    private velocity: VelocityEngine
  ) {}

  public async evaluate(paymentId: string, customerId: string, amount: number, correlationId: string): Promise<AmlAlert | null> {
    const evidence: string[] = [];
    const triggeredRules: string[] = [];
    let riskScore = 0;

    // Structuring / Smurfing detection mock
    if (amount > 9000 && amount < 10000) {
      riskScore += 50;
      evidence.push("Transaction amount just below reporting threshold.");
      triggeredRules.push("STRUCTURING_DETECTED");
    }

    // Velocity
    if (!this.velocity.checkVelocity(customerId, amount)) {
      riskScore += 80;
      evidence.push("Daily velocity limit exceeded.");
      triggeredRules.push("VELOCITY_BREACHED");
    }

    if (riskScore > 0) {
      const alert: AmlAlert = {
        alertId: crypto.randomUUID(),
        riskScore,
        evidence,
        triggeredRules,
        timestamp: new Date(),
        correlationId
      };

      await this.bus.publish('payment.domain.compliance.amlalertcreated', {
        eventId: crypto.randomUUID(),
        correlationId,
        traceId: crypto.randomUUID(),
        aggregateId: paymentId,
        aggregateType: 'Payment',
        eventType: 'AmlAlertCreated',
        version: 'v1',
        occurredAt: new Date(),
        producer: 'AmlEngine',
        payload: alert,
        headers: {}
      });

      return alert;
    }
    return null; // Passed without alerts
  }
}
