import { IntegrationEvent } from '@payment-os/event-contracts';

export interface IMessageSerializer {
  serialize(event: IntegrationEvent): Buffer;
  deserialize(data: Buffer): IntegrationEvent;
}

export class JsonMessageSerializer implements IMessageSerializer {
  public serialize(event: IntegrationEvent): Buffer {
    return Buffer.from(JSON.stringify(event), 'utf8');
  }

  public deserialize(data: Buffer): IntegrationEvent {
    return JSON.parse(data.toString('utf8')) as IntegrationEvent;
  }
}
