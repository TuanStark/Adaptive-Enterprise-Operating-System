import { IIntegrationEvent } from './integration-event';

export const INTEGRATION_EVENT_BUS = 'INTEGRATION_EVENT_BUS';

export interface IIntegrationEventBus {
  publish(event: IIntegrationEvent): Promise<void>;
}
