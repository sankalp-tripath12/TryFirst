import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    super({ port: 6380, host: 'localhost' });
  }

  onModuleDestroy() {
    this.disconnect();
  }
}
