import { Controller, Get, Query } from '@nestjs/common';
import { ShoppingPlannerService } from './shopping-planner.service';

@Controller('planner')
export class ShoppingPlannerController {
  constructor(private planner: ShoppingPlannerService) {}

  @Get()
  plan(
    @Query('budget') budget = '3000',
    @Query('minutes') minutes = '90',
    @Query('occasion') occasion = 'casual',
  ) {
    return this.planner.plan(Number(budget), Number(minutes), occasion);
  }
}
