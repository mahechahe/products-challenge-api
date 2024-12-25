import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { TransactionsService } from '../../application/services/transaction.service';

@Controller({})
export class TransactionController {
  transactionsService: TransactionsService;

  constructor(transactionsService: TransactionsService) {
    this.transactionsService = transactionsService;
  }

  @Get('/transaction/:id')
  @HttpCode(200)
  findTransaction(@Param('id') id: string) {
    return this.transactionsService.findStatusTransaction(id);
  }
}
