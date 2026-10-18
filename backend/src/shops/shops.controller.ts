import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('shops')
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('shopkeeper')
  @Post()
  create(
    @Body() dto: CreateShopDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.shopsService.create(dto, user.userId);
  }
}
