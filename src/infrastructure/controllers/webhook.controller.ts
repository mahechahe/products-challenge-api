import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventWompi, ResponseWompi } from 'src/domain/entities/webhook.entity';
import { WebHookService } from '../../application/services/webhook.service';

@ApiTags('webhooks')
@Controller({})
export class WebhookController {
  constructor(private readonly webHookService: WebHookService) {}

  @Post('wompi')
  @ApiOperation({ summary: 'Handle wompi event' })
  @ApiBody({ type: EventWompi, examples: {} })
  @ApiResponse({
    status: 200,
    description: 'Return response wompi',
    example: {
      success: true,
      message: 'Event handled',
    },
  })
  @HttpCode(200)
  async handleWompiEvent(@Body() event: EventWompi): Promise<ResponseWompi> {
    return this.webHookService.exec(event);
  }
}
