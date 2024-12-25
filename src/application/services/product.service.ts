import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
    @Inject('DYNAMO_CLIENT')
    private readonly dynamoClient: DynamoDBDocumentClient,
  ) {}

  async getProductById(productId: number): Promise<any> {
    try {
      const params = {
        TableName: 'products',
        Key: { id: productId },
      };

      const command = new GetCommand(params);
      const result = await this.dynamoClient.send(command);

      if (!result.Item) {
        throw new HttpException(
          `Producto con id ${productId} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      return result.Item;
    } catch (error) {
      console.error('Error al obtener el producto por ID :', error);
      throw new HttpException(
        'Error al obtener el producto.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProducts(): Promise<any[]> {
    try {
      const params = {
        TableName: 'products',
      };

      const command = new ScanCommand(params);
      const result = await this.dynamoClient.send(command);

      return result.Items || [];
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      throw new HttpException(
        'Error al obtener los productos.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
