import { EventWompi, ResponseWompi } from '../entities/webhook.entity';

export interface WebhookPort {
  handleWompiEvent(event: EventWompi): Promise<ResponseWompi>;
}
