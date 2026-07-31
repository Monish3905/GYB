import * as crypto from 'crypto';
import { IntegrationEvent } from '@payment-os/event-contracts';

export class EventSigner {
  constructor(private secretKey: string) {}

  public sign(event: Omit<IntegrationEvent, 'signature' | 'hash'>): IntegrationEvent {
    const payloadString = JSON.stringify(event.payload);
    
    // Hash
    const hash = crypto.createHash('sha256').update(payloadString).digest('hex');
    
    // Signature
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(`${event.eventId}:${hash}`);
    const signature = hmac.digest('hex');

    return {
      ...event,
      hash,
      signature
    } as IntegrationEvent;
  }

  public verify(event: IntegrationEvent): boolean {
    if (!event.hash || !event.signature) return false;
    
    const payloadString = JSON.stringify(event.payload);
    const expectedHash = crypto.createHash('sha256').update(payloadString).digest('hex');
    
    if (expectedHash !== event.hash) return false;

    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(`${event.eventId}:${expectedHash}`);
    const expectedSignature = hmac.digest('hex');

    return expectedSignature === event.signature;
  }
}
