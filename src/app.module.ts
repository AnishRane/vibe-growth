import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { MetricsTrackerInterceptor } from './health/metrics-tracker.interceptor';

@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsTrackerInterceptor,
    },
  ],
})
export class AppModule {}
