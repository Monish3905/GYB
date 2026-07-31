import { IEventBus } from '@payment-os/events';
import { MultiLevelNetting, Obligation, NettingLevel } from './MultiLevelNetting';
import { DynamicSettlementWindow, WindowConfig } from './DynamicSettlementWindow';
import { ReportingEngine } from './ReportingEngine';

export class ClearingHouse {
  private nettingEngine: MultiLevelNetting;
  private windowManager: DynamicSettlementWindow;
  private reporting: ReportingEngine;
  private unnettedObligations: Obligation[] = [];

  constructor(private eventBus: IEventBus) {
    this.nettingEngine = new MultiLevelNetting(eventBus);
    this.windowManager = new DynamicSettlementWindow(eventBus);
    this.reporting = new ReportingEngine();
  }

  public async ingestObligation(obligation: Obligation): Promise<void> {
    // Validate obligation
    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'ObligationValidated',
      obligationId: obligation.id
    } as any);

    this.unnettedObligations.push(obligation);
    this.reporting.recordGrossVolume(obligation.amount);
  }

  public async triggerNettingCycle(level: NettingLevel): Promise<Obligation[]> {
    if (this.unnettedObligations.length === 0) return [];

    const obligationsToNet = [...this.unnettedObligations];
    this.unnettedObligations = [];

    const netObligations = await this.nettingEngine.net(level, obligationsToNet);
    
    let netSum = 0;
    netObligations.forEach(o => netSum += o.amount);
    this.reporting.recordNetVolume(netSum);

    return netObligations;
  }

  public getReportingEngine(): ReportingEngine {
    return this.reporting;
  }

  public getWindowManager(): DynamicSettlementWindow {
    return this.windowManager;
  }
}
