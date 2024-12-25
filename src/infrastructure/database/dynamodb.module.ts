import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/* DynamoDB config */
@Module({
  providers: [
    {
      provide: 'DYNAMO_CLIENT',
      useFactory: () => {
        const client = new DynamoDBClient({
          region: 'us-east-1',
        });
        return DynamoDBDocumentClient.from(client);
      },
    },
  ],
  exports: ['DYNAMO_CLIENT'],
})
export class DynamoDBModule {}
