import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../services/product.service';

describe('ProductService', () => {
  let productService: ProductService;
  let dynamoClientMock: Partial<DynamoDBDocumentClient>;

  beforeEach(async () => {
    // Creamos un mock de DynamoDBDocumentClient
    dynamoClientMock = {
      send: jest.fn(), // Mockeamos la función send
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: 'DYNAMO_CLIENT',
          useValue: dynamoClientMock, // Usamos el mock aquí
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
  });

  describe('getProductById', () => {
    it('should return the product if found', async () => {
      const mockProduct = { id: 1, name: 'Product 1' };

      // Mockeamos la respuesta de 'send' para el comando GetCommand
      (dynamoClientMock.send as jest.Mock).mockResolvedValueOnce({
        Item: mockProduct,
      });

      const result = await productService.getProductById(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw a NotFound exception if the product is not found', async () => {
      (dynamoClientMock.send as jest.Mock).mockResolvedValueOnce({});

      try {
        await productService.getProductById(1);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe('Producto con id 1 no encontrado');
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an InternalServerError exception if there is an error', async () => {
      (dynamoClientMock.send as jest.Mock).mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      try {
        await productService.getProductById(1);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe('Error al obtener el producto.');
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getProducts', () => {
    it('should return a list of products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ];

      // Mockeamos la respuesta de 'send' para el comando ScanCommand
      (dynamoClientMock.send as jest.Mock).mockResolvedValueOnce({
        Items: mockProducts,
      });

      const result = await productService.getProducts();
      expect(result).toEqual(mockProducts);
    });

    it('should return an empty array if no products are found', async () => {
      (dynamoClientMock.send as jest.Mock).mockResolvedValueOnce({ Items: [] });

      const result = await productService.getProducts();
      expect(result).toEqual([]);
    });

    it('should throw an InternalServerError exception if there is an error', async () => {
      (dynamoClientMock.send as jest.Mock).mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      try {
        await productService.getProducts();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe('Error al obtener los productos.');
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
