import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { QualityCheckModule } from './quality-check/quality-check.module';
import { ShoppingPlannerModule } from './shopping-planner/shopping-planner.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: Number(config.get('POSTGRES_PORT')),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    RedisModule,
    HealthModule,
    AuthModule,
    ShopsModule,
    ProductsModule,
    ReservationsModule,
    RecommendationsModule,
    ShoppingPlannerModule,
    QualityCheckModule,
  ],
})
export class AppModule {}
