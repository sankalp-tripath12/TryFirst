import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  @Get(':variantId')
  similar(@Param('variantId') variantId: string) {
    return this.service.similarTo(variantId);
  }
}
