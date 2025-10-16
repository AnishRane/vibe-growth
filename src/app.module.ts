import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { MetricsModule } from './metrics/metrics.module';
import { IntentModule } from './intent/intent.module';
import { MetricsTrackerInterceptor } from './health/health-metrics-tracker.interceptor';
import { ApiKeyInterceptor } from './common/interceptors/api-key.interceptor';
import { EnvironmentConfigModule } from './config/environment-config.module';

@Module({
  imports: [HealthModule, CampaignsModule, MetricsModule, IntentModule,EnvironmentConfigModule],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiKeyInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsTrackerInterceptor,
    },
  ],
})
export class AppModule {}
