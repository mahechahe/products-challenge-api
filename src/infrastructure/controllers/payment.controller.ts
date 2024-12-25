import { Body, Controller, Get, Post } from '@nestjs/common';
import { Card } from '../../domain/entities/card.entity';
import {
  PaymentBodyDto,
  TransactionDto,
} from '../../domain/entities/payment.entity';
import { PaymentService } from '../../application/services/payment.service';

@Controller({})
export class PaymentController {
  paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  @Get('/payments')
  getAllProducts() {
    return this.paymentService.getPayments();
  }

  @Post('tokenizar-credit')
  async createProduct(@Body() card: Card) {
    const result = await this.paymentService.createTokenCard(card);
    return result;
  }

  @Get('/accepted-token')
  async acceptedToken() {
    const result = await this.paymentService.getAcceptanceToken();
    return result;
  }

  @Post('create-transaction')
  async createTransaction(@Body() transaction: TransactionDto) {
    const result = await this.paymentService.createTransaction(transaction);
    return result;
  }

  @Post('create-payment')
  async createPayment(@Body() payment: PaymentBodyDto) {
    const result = await this.paymentService.createPayment(payment);
    return result;
  }
}
