import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EventWompi,
  ResponseWompi,
} from '../../domain/entities/webhook.entity';

export class WebHookService {
  constructor(
    @Inject('DYNAMO_CLIENT')
    private readonly dynamoClient: DynamoDBDocumentClient,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async exec(event: EventWompi): Promise<ResponseWompi> {
    if (event.data.transaction.status === 'PENDING') {
      return {
        success: true,
        message: 'Event handled',
      };
    }

    const checkParams = {
      TableName: 'transactions',
      Key: {
        id: event.data.transaction.reference,
      },
    };

    const result = await this.dynamoClient.send(new GetCommand(checkParams));

    if (!result.Item) {
      throw new HttpException('PAYMENT NOT FOUND', HttpStatus.NOT_FOUND);
    }

    if (event.data.transaction.status === 'APPROVED') {
      const checkParamsUpdate = {
        TableName: 'transactions',
        Key: {
          id: event.data.transaction.reference,
        },
        UpdateExpression: 'set #statusTransaction = :statusTransaction',
        ExpressionAttributeNames: {
          '#statusTransaction': 'status_transaction',
        },
        ExpressionAttributeValues: {
          ':statusTransaction': 'APPROVED',
        },
      };

      await this.dynamoClient.send(new UpdateCommand(checkParamsUpdate));
    }

    if (event.data.transaction.status === 'REJECTED') {
      const checkParamsUpdate = {
        TableName: 'transactions',
        Key: {
          id: event.data.transaction.reference,
        },
        UpdateExpression: 'set #statusTransaction = :statusTransaction',
        ExpressionAttributeNames: {
          '#statusTransaction': 'status_transaction',
        },
        ExpressionAttributeValues: {
          ':statusTransaction': 'REJECTED',
        },
      };

      await this.dynamoClient.send(new UpdateCommand(checkParamsUpdate));
    }

    return {
      success: true,
      message: 'Trnsaction updated',
    };
  }
}
