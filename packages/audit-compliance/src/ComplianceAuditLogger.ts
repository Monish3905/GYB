export interface AuditLogEntry {
  auditId: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ip?: string;
  deviceFingerprint?: string;
  correlationId: string;
  traceId: string;
  timestamp: Date;
}

export class ComplianceAuditLogger {
  private logs: AuditLogEntry[] = [];

  public log(entry: Omit<AuditLogEntry, 'auditId' | 'timestamp'>): void {
    this.logs.push({
      ...entry,
      auditId: crypto.randomUUID(),
      timestamp: new Date()
    });
  }

  public getLogsFor(entityId: string): AuditLogEntry[] {
    return this.logs.filter(l => l.entityId === entityId);
  }

  public getAllLogs(): AuditLogEntry[] {
    // Returns a copy - logs are immutable
    return [...this.logs];
  }
}
