export type RuleOperator = 'AND' | 'OR' | 'NOT';
export type RuleConditionType = 'THRESHOLD' | 'RANGE' | 'COUNTRY' | 'CURRENCY' | 'WALLET' | 'PROVIDER' | 'TRANSACTION';

export interface RuleCondition {
  field: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'in' | 'not_in';
  value: any;
}

export interface Rule {
  ruleId: string;
  name: string;
  version: string;
  type: RuleConditionType;
  logicOperator: RuleOperator;
  conditions: RuleCondition[];
  action: 'FLAG' | 'BLOCK' | 'REVIEW' | 'APPROVE';
  enabled: boolean;
}

export class RuleEngine {
  private rules: Map<string, Rule> = new Map();

  public registerRule(rule: Rule): void {
    this.rules.set(rule.ruleId, rule);
  }

  public evaluateContext(context: Record<string, any>): { triggered: Rule[]; allPassed: boolean } {
    const triggered: Rule[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      const matched = this.evaluateRule(rule, context);
      if (matched) triggered.push(rule);
    }

    const allPassed = triggered.every(r => r.action === 'APPROVE');
    return { triggered, allPassed };
  }

  private evaluateRule(rule: Rule, context: Record<string, any>): boolean {
    const results = rule.conditions.map(condition => this.evaluateCondition(condition, context));

    if (rule.logicOperator === 'AND') return results.every(Boolean);
    if (rule.logicOperator === 'OR') return results.some(Boolean);
    if (rule.logicOperator === 'NOT') return !results[0];
    return false;
  }

  private evaluateCondition(condition: RuleCondition, context: Record<string, any>): boolean {
    const contextValue = context[condition.field];
    const ruleValue = condition.value;

    switch (condition.operator) {
      case 'gt':  return contextValue > ruleValue;
      case 'lt':  return contextValue < ruleValue;
      case 'gte': return contextValue >= ruleValue;
      case 'lte': return contextValue <= ruleValue;
      case 'eq':  return contextValue === ruleValue;
      case 'neq': return contextValue !== ruleValue;
      case 'in':  return Array.isArray(ruleValue) && ruleValue.includes(contextValue);
      case 'not_in': return Array.isArray(ruleValue) && !ruleValue.includes(contextValue);
      default: return false;
    }
  }
}
