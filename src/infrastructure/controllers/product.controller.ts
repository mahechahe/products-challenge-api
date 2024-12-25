import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ProductService } from '../../application/services/product.service';

@Controller({})
export class ProductController {
  productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  @Get('/products')
  @HttpCode(200)
  getAllProducts() {
    return this.productService.getProducts();
  }

  @Get('/product/:id')
  @HttpCode(200)
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(Number(id));
  }

  @Post('/product')
  createProduct() {
    return 'Creando';
  }
}
