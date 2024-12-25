import { Module } from '@nestjs/common';
import { DynamoDBModule } from '../database/dynamodb.module'; // Asegúrate de importar DynamoDBModule si es necesario
import { WebHookService } from '../../application/services/webhook.service';
import { WebhookController } from '../controllers/webhook.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, ConfigModule, DynamoDBModule],
  controllers: [WebhookController],
  providers: [WebHookService],
})
export class WebhookModule {}
