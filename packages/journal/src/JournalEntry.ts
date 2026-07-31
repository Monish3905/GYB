export type PostingDirection = 'DEBIT' | 'CREDIT';

export interface JournalPosting {
  postingId: string;
  accountId: string;
  direction: PostingDirection;
  amount: number;
  currency: string;
  sequenceNumber?: number; // Assigned by PostingEngine
}

export type JournalStatus = 'DRAFT' | 'VALIDATED' | 'POSTED' | 'REJECTED' | 'REVERSED';

export interface JournalEntry {
  journalId: string;
  ledgerSequence?: number; // Assigned by Ledger
  transactionId?: string;
  executionId?: string;
  settlementId?: string;
  correlationId?: string;
  
  timestamp: Date;
  createdBy: string;
  
  status: JournalStatus;
  
  currency: string; // Primary currency for this entry
  postings: JournalPosting[];
  
  description: string;
  metadata?: any;
  
  // Reversal link
  reversedByJournalId?: string;
  isReversalOfJournalId?: string;
}
