import { Module } from '@nestjs/common';
import { PaymentController } from '../controllers/payment.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBModule } from '../../infrastructure/database/dynamodb.module';
import { PaymentService } from '../../application/services/payment.service';

@Module({
  imports: [HttpModule, ConfigModule, DynamoDBModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentsModule {}
