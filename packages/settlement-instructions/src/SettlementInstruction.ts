export type SettlementMethod = 'SWIFT' | 'SEPA' | 'ACH' | 'RTP' | 'BLOCKCHAIN' | 'INTERNAL';
export type SettlementStatus = 'PENDING' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelayMs: number;
}

export interface SettlementInstruction {
  instructionId: string;
  settlementId: string;
  correlationId: string;
  treasuryPool: string;
  sourceCurrency: string;
  destinationCurrency: string;
  sourceCountry: string;
  destinationCountry: string;
  settlementProvider: string;
  settlementMethod: SettlementMethod;
  blockchain?: string;
  bank?: string;
  priority: PriorityLevel;
  amount: number;
  status: SettlementStatus;
  createdTime: Date;
  executionWindow: {
    start: Date;
    end: Date;
  };
  retryPolicy: RetryPolicy;
}

export class SettlementInstructionBuilder {
  private instruction: Partial<SettlementInstruction> = {};

  constructor() {
    this.instruction.createdTime = new Date();
    this.instruction.status = 'PENDING';
  }

  setInstructionId(id: string) { this.instruction.instructionId = id; return this; }
  setSettlementId(id: string) { this.instruction.settlementId = id; return this; }
  setCorrelationId(id: string) { this.instruction.correlationId = id; return this; }
  setTreasuryPool(pool: string) { this.instruction.treasuryPool = pool; return this; }
  setSourceCurrency(currency: string) { this.instruction.sourceCurrency = currency; return this; }
  setDestinationCurrency(currency: string) { this.instruction.destinationCurrency = currency; return this; }
  setSourceCountry(country: string) { this.instruction.sourceCountry = country; return this; }
  setDestinationCountry(country: string) { this.instruction.destinationCountry = country; return this; }
  setSettlementProvider(provider: string) { this.instruction.settlementProvider = provider; return this; }
  setSettlementMethod(method: SettlementMethod) { this.instruction.settlementMethod = method; return this; }
  setBlockchain(blockchain: string) { this.instruction.blockchain = blockchain; return this; }
  setBank(bank: string) { this.instruction.bank = bank; return this; }
  setPriority(priority: PriorityLevel) { this.instruction.priority = priority; return this; }
  setAmount(amount: number) { this.instruction.amount = amount; return this; }
  setExecutionWindow(start: Date, end: Date) { this.instruction.executionWindow = { start, end }; return this; }
  setRetryPolicy(policy: RetryPolicy) { this.instruction.retryPolicy = policy; return this; }

  build(): Readonly<SettlementInstruction> {
    // Immutable return
    return Object.freeze(this.instruction as SettlementInstruction);
  }
}
