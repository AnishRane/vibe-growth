import { ApiProperty } from '@nestjs/swagger';

export class CampaignStats {
  @ApiProperty({ description: 'Total number of impressions', example: 10000 })
  impressions: number;

  @ApiProperty({ description: 'Total number of clicks', example: 500 })
  clicks: number;

  @ApiProperty({ description: 'Total number of conversions', example: 50 })
  conversions: number;

  @ApiProperty({ description: 'Total spend in dollars', example: 1000.50 })
  spend: number;
}

export class DailyMetric {
  @ApiProperty({ description: 'Date of the metric (ISO 8601 format)', example: '2025-10-15' })
  date: string;

  @ApiProperty({ description: 'Number of impressions for the day', example: 1000 })
  impressions: number;

  @ApiProperty({ description: 'Number of clicks for the day', example: 50 })
  clicks: number;

  @ApiProperty({ description: 'Number of conversions for the day', example: 5 })
  conversions: number;

  @ApiProperty({ description: 'Spend for the day in dollars', example: 100.50 })
  spend: number;
}

export class Campaign {
  @ApiProperty({ description: 'Unique campaign identifier', example: 'camp_123' })
  id: string;

  @ApiProperty({ description: 'Campaign name', example: 'Summer Sale 2025' })
  name: string;

  @ApiProperty({ 
    description: 'Campaign status', 
    enum: ['active', 'paused', 'completed'],
    example: 'active' 
  })
  status: 'active' | 'paused' | 'completed';

  @ApiProperty({ description: 'Campaign start date (ISO 8601 format)', example: '2025-06-01' })
  startDate: string;

  @ApiProperty({ description: 'Campaign end date (ISO 8601 format)', required: false, example: '2025-08-31' })
  endDate?: string;

  @ApiProperty({ description: 'Campaign budget in dollars', example: 5000 })
  budget: number;

  @ApiProperty({ description: 'Aggregated campaign statistics', type: CampaignStats })
  stats: CampaignStats;

  @ApiProperty({ 
    description: 'Daily breakdown of metrics', 
    type: [DailyMetric],
    required: false 
  })
  dailyMetrics?: DailyMetric[];
}

export class CampaignKPIs {
  @ApiProperty({ description: 'Click-through rate (clicks/impressions)', example: 0.05 })
  ctr: number;

  @ApiProperty({ description: 'Conversion rate (conversions/clicks)', example: 0.10 })
  cvr: number;

  @ApiProperty({ description: 'Cost per click in dollars', example: 2.00 })
  cpc: number;

  @ApiProperty({ description: 'Cost per acquisition in dollars', example: 20.01 })
  cpa: number;
}

export class CampaignWithKPIs extends Campaign {
  @ApiProperty({ description: 'Key Performance Indicators', type: CampaignKPIs })
  kpis: CampaignKPIs;
}

