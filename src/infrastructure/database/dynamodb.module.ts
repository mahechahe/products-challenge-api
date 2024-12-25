import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Asegúrate de importar ConfigModule y ConfigService
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Module({
  imports: [ConfigModule], // Asegúrate de importar ConfigModule aquí
  providers: [
    {
      provide: 'DYNAMO_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const accessKey = configService.get<string>('AWS_ACCESS_KEY');
        const secretKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');

        if (!accessKey || !secretKey) {
          throw new Error(
            'AWS credentials are not set in the environment variables',
          );
        }

        const client = new DynamoDBClient({
          region: 'us-east-1',
          credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
          },
        });

        return DynamoDBDocumentClient.from(client);
      },
      inject: [ConfigService], // Asegúrate de inyectar ConfigService aquí
    },
  ],
  exports: ['DYNAMO_CLIENT'],
})
export class DynamoDBModule {}
