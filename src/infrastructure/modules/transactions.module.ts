import { Module } from '@nestjs/common';
import { DynamoDBModule } from '../database/dynamodb.module';
import { TransactionController } from '../controllers/transactions.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TransactionsService } from '../../application/services/transaction.service';

@Module({
  imports: [HttpModule, ConfigModule, DynamoDBModule],
  controllers: [TransactionController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
