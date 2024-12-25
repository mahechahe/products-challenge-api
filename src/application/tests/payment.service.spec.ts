import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../services/payment.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PaymentService', () => {
  let service: PaymentService;
  let dynamoClient: DynamoDBDocumentClient;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: 'DYNAMO_CLIENT',
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              post: jest.fn(),
              get: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    dynamoClient = module.get<DynamoDBDocumentClient>('DYNAMO_CLIENT');
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getPayments', () => {
    it('should return a list of payments', () => {
      const result = service.getPayments();
      expect(result).toEqual(['Payment 1', 'Payment 2']);
    });
  });

  describe('createTokenCard', () => {
    it('should create a token and store client if not exists', async () => {
      const card = {
        number: '1234567812345678',
        exp_month: 12,
        exp_year: 23,
        cvc: '123',
        card_holder: 'John Doe',
        identification_client: '1234',
        adress_client: '123 Street',
        city_client: 'City',
        email_client: 'email@example.com',
        phone_client: '1234567890',
      };

      /* Mock HTTP response from WOMPI API */
      httpService.axiosRef.post = jest.fn().mockResolvedValue({
        data: {
          data: {
            id: 'token_id',
            created_at: '2024-01-01',
            brand: 'VISA',
            name: 'John Doe',
            last_four: '5678',
            bin: '123456',
            exp_year: 23,
            exp_month: 12,
            card_holder: 'John Doe',
            expires_at: '2024-12-01',
          },
        },
      });

      /* Mock DynamoDB Get and Put responses */
      dynamoClient.send = jest
        .fn()
        .mockResolvedValueOnce({ Item: null }) // Simulate client not found
        .mockResolvedValueOnce({}); // Simulate successful put

      const token = await service.createTokenCard(card);

      expect(token).toBeDefined();
      expect(dynamoClient.send).toHaveBeenCalledTimes(2);
      expect(httpService.axiosRef.post).toHaveBeenCalled();
    });

    it('should throw Unauthorized exception if WOMPI API returns 401', async () => {
      const card = { number: '1234567812345678' };

      httpService.axiosRef.post = jest.fn().mockRejectedValue({
        response: { status: 401 },
      });

      await expect(service.createTokenCard(card)).rejects.toThrow(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('getAcceptanceToken', () => {
    it('should return an acceptance token', async () => {
      /* Mock HTTP response from WOMPI API */
      httpService.axiosRef.get = jest.fn().mockResolvedValue({
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance_token',
            permalink: 'permalink',
            type: 'type',
          },
        },
      });

      const result = await service.getAcceptanceToken();

      expect(result.acceptance_token).toEqual('acceptance_token');
    });
  });

  describe('createPayment', () => {
    it('should process payment and return payment data', async () => {
      const paymentDto = {
        transaction_id: '123',
        acceptance_token: 'acceptance_token',
        payment_method: {
          type: 'credit_card',
          installments: 1,
          token: 'card_token',
        },
        session_id: 'session_id',
      };

      /* Mock DynamoDB Get response */
      dynamoClient.send = jest.fn().mockResolvedValueOnce({
        Item: {
          id: '123',
          adress_client: '123 Street',
          city_client: 'City',
          email_client: 'email@example.com',
          phone_client: '1234567890',
          total_transaction: 100,
        },
      });

      /* Mock HTTP response from WOMPI API for payment transaction */
      httpService.axiosRef.post = jest.fn().mockResolvedValue({
        data: { data: { id: 'wompi_transaction_id', status: 'APPROVED' } },
      });

      const result = await service.createPayment(paymentDto);

      expect(result.wompiTransactionId).toEqual('wompi_transaction_id');
      expect(result.status).toEqual('APPROVED');
    });

    it('should throw error if transaction not found', async () => {
      const paymentDto = { transaction_id: 'nonexistent_id' };

      // Mock DynamoDB Get response - transaction not found
      dynamoClient.send = jest.fn().mockResolvedValueOnce({ Item: null });

      await expect(service.createPayment(paymentDto)).rejects.toThrow(
        new HttpException(
          'No hemos podido encontrar la transaccion asociada',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const transactionDto = {
        idClient: 'client123',
        adressClient: '123 Street',
        cityClient: 'City',
        emailClient: 'email@example.com',
        phoneClient: '1234567890',
        totalTransaction: 100,
        totalTransactionWhitoutTaxes: 80,
        taxesTransaction: 20,
        productsTransaction: ['product1', 'product2'],
      };

      dynamoClient.send = jest.fn().mockResolvedValueOnce({
        Item: { id: 'client123' },
      });

      dynamoClient.send = jest.fn().mockResolvedValueOnce({});

      const result = await service.createTransaction(transactionDto);

      expect(result.idTransaction).toBeDefined();
    });

    it('should throw error if client not found', async () => {
      const transactionDto = { idClient: 'nonexistent_client' };

      dynamoClient.send = jest.fn().mockResolvedValueOnce({ Item: null });

      await expect(service.createTransaction(transactionDto)).rejects.toThrow(
        new HttpException(
          'No hemos podido encontrar al cliente asociado',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
