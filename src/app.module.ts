import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { MetricsModule } from './metrics/metrics.module';
import { IntentModule } from './intent/intent.module';
import { MetricsTrackerInterceptor } from './health/metrics-tracker.interceptor';

@Module({
  imports: [HealthModule, CampaignsModule, MetricsModule, IntentModule],
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
