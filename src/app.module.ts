import { Module } from '@nestjs/common';
import { HelloController } from './infrastructure/controllers/hello.controller';
import { DynamoDBModule } from './infrastructure/database/dynamodb.module';
import { WebhookModule } from './infrastructure/modules/webhook.module';
import { PaymentsModule } from './infrastructure/modules/payments.module';
import { ProductsModel } from './infrastructure/modules/products.module';
import { TransactionsModule } from './infrastructure/modules/transactions.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ProductsModel,
    PaymentsModule,
    TransactionsModule,
    DynamoDBModule,
    WebhookModule,
    ConfigModule.forRoot(),
  ],
  providers: [],
  controllers: [HelloController],
})
export class AppModule {}
