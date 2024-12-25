import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../services/transaction.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let httpServiceMock: Partial<HttpService>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(async () => {
    // Mock de axiosRef con solo el método get
    httpServiceMock = {
      axiosRef: {
        get: jest.fn(),
        // Mockear otros métodos si es necesario , como post, put, etc.
      } as any, // Usar `any` para evitar los errores de tipado
    };

    configServiceMock = {
      get: jest.fn().mockReturnValue('https://api.wompi.co'), // Mock de la URL de la API
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('findStatusTransaction', () => {
    it('should return the status of the transaction when successful', async () => {
      const mockTransactionId = '12345';
      const mockResponse = {
        data: {
          data: {
            status: 'APPROVED',
            id: mockTransactionId,
          },
        },
      };

      // Simulamos una respuesta exitosa
      (httpServiceMock.axiosRef.get as jest.Mock).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await service.findStatusTransaction(mockTransactionId);

      expect(result).toEqual({
        statusTransaction: 'APPROVED',
        idTransaction: mockTransactionId,
      });
    });

    it('should throw an HttpException when there is an error', async () => {
      const mockTransactionId = '12345';

      // Simulamos un error en la llamada HTTP
      (httpServiceMock.axiosRef.get as jest.Mock).mockRejectedValueOnce(
        new Error('API Error'),
      );

      try {
        await service.findStatusTransaction(mockTransactionId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe(
          'Error al obtener el estado de la transaccion',
        );
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
