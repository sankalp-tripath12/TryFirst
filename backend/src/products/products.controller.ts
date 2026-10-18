import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shopkeeper')
  @Post()
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.productsService.create(dto, user.userId);
  }

  @Get()
  search(@Query() filters: SearchProductsDto) {
    return this.productsService.search(filters);
  }
}
