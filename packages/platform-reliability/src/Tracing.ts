import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

export class TracingInitializer {
  private sdk: NodeSDK;

  constructor(serviceName: string) {
    this.sdk = new NodeSDK({
      serviceName,
      instrumentations: [getNodeAutoInstrumentations()]
    });
  }

  public async start(): Promise<void> {
    try {
      this.sdk.start();
      console.log('Tracing initialized');
    } catch (error) {
      console.error('Error initializing tracing', error);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this.sdk.shutdown();
      console.log('Tracing terminated');
    } catch (error) {
      console.error('Error terminating tracing', error);
    }
  }
}
