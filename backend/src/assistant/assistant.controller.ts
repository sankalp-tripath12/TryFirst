import { Controller, Get, Query } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private service: AssistantService) {}

  @Get()
  ask(@Query('q') q: string) {
    return this.service.ask(q);
  }
}
