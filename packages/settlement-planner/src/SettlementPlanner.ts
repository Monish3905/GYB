import { IEventBus } from '@payment-os/events';
import { OptimizationStrategy, PlanningContext, SettlementPlan } from './OptimizationStrategy';

export class SettlementPlanner {
  private activeStrategy: OptimizationStrategy;

  constructor(
    private eventBus: IEventBus,
    defaultStrategy: OptimizationStrategy
  ) {
    this.activeStrategy = defaultStrategy;
  }

  public setStrategy(strategy: OptimizationStrategy) {
    this.activeStrategy = strategy;
  }

  public async planSettlements(context: PlanningContext): Promise<SettlementPlan> {
    // Determine which obligations settle now, wait, batch, split, or reroute
    const plan = this.activeStrategy.optimize(context);

    // Publish event
    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'SettlementPlanned',
      planId: plan.planId
    } as any);

    return plan;
  }
}
