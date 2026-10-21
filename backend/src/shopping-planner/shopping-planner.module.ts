import { Module } from '@nestjs/common';
import { ShoppingPlannerController } from './shopping-planner.controller';
import { ShoppingPlannerService } from './shopping-planner.service';

@Module({
  controllers: [ShoppingPlannerController],
  providers: [ShoppingPlannerService],
})
export class ShoppingPlannerModule {}
