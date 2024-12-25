import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  WOMPI_API_URL,
  WOMPI_INTEGRITY_KEY,
  WOMPI_PRIVATE_KEY,
  WOMPI_PUBLIC_KEY,
} from '../../configuration';
import {
  PaymentBodyDto,
  TransactionDto,
} from '../../domain/entities/payment.entity';
import { Acceptance, Card, Token } from '../../domain/entities/card.entity';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('DYNAMO_CLIENT')
    private readonly dynamoClient: DynamoDBDocumentClient,
    private httpService: HttpService,
  ) {}

  getPayments() {
    return ['Payment 1', 'Payment 2'];
  }

  async createTokenCard(card: Card): Promise<any> {
    try {
      const bodyCard = {
        number: card.number,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvc: card.cvc,
        card_holder: card.card_holder,
      };

      const response = await this.httpService.axiosRef
        .post(`${WOMPI_API_URL}/tokens/cards`, bodyCard, {
          headers: {
            Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
            Content_Type: 'application/json',
          },
        })
        .then((response) => response.data.data);

      const checkParams = {
        TableName: 'clients',
        Key: {
          id: card.identification_client,
        },
      };

      const result = await this.dynamoClient.send(new GetCommand(checkParams));
      if (!result.Item) {
        const createParams = {
          TableName: 'clients',
          Item: {
            identification: card.identification_client,
            adress_client: card.adress_client,
            city_client: card.city_client,
            email_client: card.email_client,
            phone_client: card.phone_client,
            name: card.card_holder,
            createdAt: new Date().toISOString(),
            id: card.identification_client,
          },
        };

        await this.dynamoClient.send(new PutCommand(createParams));
      }

      return new Token(
        response.id,
        response.created_at,
        response.brand,
        response.name,
        response.last_four,
        response.bin,
        response.exp_year,
        response.exp_month,
        response.card_holder,
        response.expires_at,
      );
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
      }

      console.error('Error al crear el token:', error);
      throw new HttpException(
        'Error al crear el token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAcceptanceToken(): Promise<Acceptance> {
    const url = `${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`;

    const response = await this.httpService.axiosRef
      .get(url)
      .then((response) => response.data);

    return new Acceptance(
      response.data.presigned_acceptance.acceptance_token,
      response.data.presigned_acceptance.permalink,
      response.data.presigned_acceptance.type,
    );
  }

  async createPayment(payment: PaymentBodyDto): Promise<any> {
    const checkParams = {
      TableName: 'transactions',
      Key: {
        id: payment.transaction_id,
      },
    };

    const result = await this.dynamoClient.send(new GetCommand(checkParams));

    if (!result.Item) {
      throw new HttpException(
        'No hemos podido encontrar la transaccion asociada',
        HttpStatus.NOT_FOUND,
      );
    }

    const getItem = result.Item;
    const REFERENCE_PAY = getItem.id;

    const shipment = {
      address: getItem.adress_client,
      city: getItem.city_client,
      country: 'CO', // País
      postalCode: '110011',
      state: 'Cundinamarca', // Departamento
      phone_number: getItem.phone_client,
    };

    const AMOUNT_IN_CENTS = getItem.total_transaction * 100;

    const SIGNATURE = `${REFERENCE_PAY}${AMOUNT_IN_CENTS}COP${WOMPI_INTEGRITY_KEY}`;

    /* Encrypt SIGNATURE using SHA256 */
    const hash = crypto.createHash('sha256').update(SIGNATURE).digest('hex');

    const body = {
      acceptance_token: payment.acceptance_token,
      amount_in_cents: AMOUNT_IN_CENTS,
      currency: 'COP',
      customer_email: getItem.email_client,
      payment_method: {
        type: payment.payment_method.type,
        installments: payment.payment_method.installments,
        token: payment.payment_method.token,
      },
      reference: REFERENCE_PAY,
      signature: hash,
      session_id: payment.session_id,
      shipping_address: {
        address_line_1: shipment.address,
        city: shipment.city,
        country: shipment.country,
        postal_code: shipment.postalCode,
        region: shipment.state,
        phone_number: getItem.phone_client,
      },
    };

    let paymentTransaction;
    try {
      const url = `${WOMPI_API_URL}/transactions`;
      paymentTransaction = await this.httpService.axiosRef
        .post(url, body, {
          headers: {
            Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
            Content_Type: 'application/json',
          },
        })
        .then((response) => response.data.data);
    } catch (error) {
      console.error('Error al procesar el pago:', error.response.data.error);
      console.error(
        'Error al procesar el pago:',
        error.response.data.error.messages.shipping_address,
      );
      throw new HttpException(
        'Ha ocurrido un error al procesar el pago.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const checkParamsUpdate = {
      TableName: 'transactions',
      Key: {
        id: payment.transaction_id,
      },
      UpdateExpression: 'set #idTransactionWompi = :idTransactionWompi',
      ExpressionAttributeNames: {
        '#idTransactionWompi': 'id_transaction_wompi',
      },
      ExpressionAttributeValues: {
        ':idTransactionWompi': paymentTransaction.id,
      },
    };
    await this.dynamoClient.send(new UpdateCommand(checkParamsUpdate));

    return {
      amount: AMOUNT_IN_CENTS,
      reference: REFERENCE_PAY,
      currency: 'COP',
      status: paymentTransaction.status,
      wompiTransactionId: paymentTransaction.id,
      transactionId: REFERENCE_PAY,
      type: payment.payment_method.type,
      installments: payment.payment_method.installments,
      token: payment.payment_method.token,
    };
  }

  async createTransaction(transaction: TransactionDto): Promise<any> {
    const checkParams = {
      TableName: 'clients',
      Key: {
        id: transaction.idClient,
      },
    };
    const result = await this.dynamoClient.send(new GetCommand(checkParams));
    if (!result.Item) {
      throw new HttpException(
        'No hemos podido encontrar al cliente asociado',
        HttpStatus.NOT_FOUND,
      );
    }

    const clientId = transaction.idClient;
    const transactionId = `ref-${Math.floor(Math.random() * 1000000)}-${clientId}`;

    const createParams = {
      TableName: 'transactions',
      Item: {
        adress_client: transaction.adressClient,
        city_client: transaction.cityClient,
        email_client: transaction.emailClient,
        id_client: transaction.idClient,
        phone_client: transaction.phoneClient,
        total_transaction: transaction.totalTransaction,
        total_transaction_whitout_taxes:
          transaction.totalTransactionWhitoutTaxes,
        taxes_transaction: transaction.taxesTransaction,
        products_transaction: transaction.productsTransaction,
        status_transaction: 'PENDING',
        createdAt: new Date().toISOString(),
        id: transactionId,
      },
    };

    await this.dynamoClient.send(new PutCommand(createParams));

    return {
      idTransaction: transactionId,
    };
  }
}
