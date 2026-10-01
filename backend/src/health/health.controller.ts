import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private dataSource: DataSource,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    await this.dataSource.query('SELECT 1');
    await this.redis.ping();
    return { status: 'ok', postgres: 'up', redis: 'up' };
  }
}
