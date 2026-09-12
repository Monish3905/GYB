export class PluginEvents {
  private subscriptions: Map<string, Array<{ pluginId: string; handler: string }>> = new Map();

  public async subscribe(pluginId: string, eventType: string, handlerRef: string): Promise<void> {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push({ pluginId, handler: handlerRef });
    console.log(`[PLUGIN EVENTS] Plugin ${pluginId} subscribed to ${eventType}`);
  }

  public async dispatch(eventType: string, payload: any): Promise<number> {
    const subs = this.subscriptions.get(eventType) || [];
    console.log(`[PLUGIN EVENTS] Dispatching ${eventType} to ${subs.length} subscribers`);
    // Execute each plugin handler in sandbox
    return subs.length;
  }

  public async unsubscribe(pluginId: string, eventType: string): Promise<void> {
    const subs = this.subscriptions.get(eventType);
    if (subs) {
      this.subscriptions.set(eventType, subs.filter(s => s.pluginId !== pluginId));
    }
  }

  public getSupportedEvents(): string[] {
    return [
      'PaymentCreated', 'PaymentSettled', 'MerchantCreated',
      'TreasuryUpdated', 'ComplianceApproved', 'SettlementCompleted',
      'ParticipantJoined', 'IncidentCreated'
    ];
  }
}
