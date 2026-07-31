import { ILLMProvider } from '@payment-os/ai-core';
import { IEventBus } from '@payment-os/event-bus';

export class CaseSummarizer {
  constructor(private llm: ILLMProvider, private bus: IEventBus) {}

  public async summarizeCase(caseId: string, caseData: any): Promise<string> {
    const prompt = `Summarize this compliance case: ${JSON.stringify(caseData)}`;
    const summary = await this.llm.chat(prompt);

    await this.bus.publish('payment.domain.ai.casesummarized', {
      eventId: crypto.randomUUID(),
      correlationId: caseId,
      traceId: crypto.randomUUID(),
      aggregateId: caseId,
      aggregateType: 'ComplianceCase',
      eventType: 'CaseSummarized',
      version: 'v1',
      occurredAt: new Date(),
      producer: 'CaseSummarizer',
      payload: {
        caseId,
        summary,
        keyRiskFactors: ['High velocity', 'Geo mismatch'], // mocked extraction
        generatedAt: new Date()
      },
      headers: {}
    });

    return summary;
  }
}
