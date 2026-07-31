export interface ExecutionRecord {
  recordId: string;
  executionId: string;
  status: string;
  timestamp: Date;
  details: any;
}

export interface SettlementRecord {
  recordId: string;
  instructionId: string;
  amount: number;
  currency: string;
  timestamp: Date;
}

export interface TreasuryRecord {
  recordId: string;
  poolId: string;
  amountChanged: number;
  timestamp: Date;
}

export interface LedgerCandidate {
  candidateId: string;
  executionId: string;
  entries: any[];
  timestamp: Date;
}

export class ReconciliationGenerator {
  public generateExecutionRecord(executionId: string, status: string, details: any): ExecutionRecord {
    return {
      recordId: crypto.randomUUID(),
      executionId,
      status,
      timestamp: new Date(),
      details
    };
  }

  public generateLedgerCandidate(executionId: string, entries: any[]): LedgerCandidate {
    return {
      candidateId: crypto.randomUUID(),
      executionId,
      entries,
      timestamp: new Date()
    };
  }

  // Future milestone 8 matching hooks would go here
}
