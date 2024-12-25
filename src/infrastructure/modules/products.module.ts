import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductService } from '../../application/services/product.service';
import { ProductController } from '../controllers/product.controller';
import { DynamoDBModule } from '../database/dynamodb.module';

@Module({
  imports: [DynamoDBModule, ConfigModule.forRoot()],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductsModel {}
