import { Module } from '@nestjs/common';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../../application/services/product.service';
import { DynamoDBModule } from '../database/dynamodb.module';

@Module({
  imports: [DynamoDBModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductsModel {}
