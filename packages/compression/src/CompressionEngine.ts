import { IEventBus } from '@payment-os/events';

export interface CompressionMetrics {
  originalObligationCount: number;
  netObligationCount: number;
  settlementInstructionCount: number;
  treasuryTransferCount: number;
  compressionRatio: number;
}

export interface CompressibleItem {
  id: string;
  source: string;
  destination: string;
  currency: string;
  amount: number;
}

export interface CompressedItem {
  id: string;
  source: string;
  destination: string;
  currency: string;
  netAmount: number;
  underlyingItems: string[];
}

export class CompressionEngine {
  constructor(private eventBus: IEventBus) {}

  public compress(items: CompressibleItem[]): CompressedItem[] {
    const originalCount = items.length;
    if (originalCount === 0) return [];

    // Group by source-destination-currency
    const groups = new Map<string, CompressedItem>();

    for (const item of items) {
      const key = `${item.source}:${item.destination}:${item.currency}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          id: crypto.randomUUID(),
          source: item.source,
          destination: item.destination,
          currency: item.currency,
          netAmount: 0,
          underlyingItems: []
        });
      }

      const group = groups.get(key)!;
      group.netAmount += item.amount;
      group.underlyingItems.push(item.id);
    }

    const result = Array.from(groups.values());

    // Publish compression metrics event
    this.publishCompressionEvent(originalCount, result.length);

    return result;
  }

  public calculateMetrics(
    original: number,
    net: number,
    instructions: number,
    transfers: number
  ): CompressionMetrics {
    const ratio = original > 0 ? (original - instructions) / original : 0;
    
    return {
      originalObligationCount: original,
      netObligationCount: net,
      settlementInstructionCount: instructions,
      treasuryTransferCount: transfers,
      compressionRatio: ratio * 100 // as percentage
    };
  }

  private publishCompressionEvent(originalCount: number, compressedCount: number) {
    this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'SettlementCompressed',
      originalCount,
      compressedCount
    } as any).catch(err => console.error("Failed to publish compression event", err));
  }
}
