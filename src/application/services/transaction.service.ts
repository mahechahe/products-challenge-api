import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('DYNAMO_CLIENT')
    private readonly dynamoClient: DynamoDBDocumentClient,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async findStatusTransaction(transactionId: string): Promise<any> {
    try {
      const response = await this.httpService.axiosRef
        .get(
          `${this.configService.get<string>('WOMPI_API_URL')}/transactions/${transactionId}`,
          {},
        )
        .then((response) => response.data.data);

      return {
        statusTransaction: response.status,
        idTransaction: response.id,
      };
    } catch (error) {
      console.error('Error al obtener el producto por ID :', error);
      throw new HttpException(
        'Error al obtener el estado de la transaccion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
