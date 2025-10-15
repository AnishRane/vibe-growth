import { ApiProperty } from '@nestjs/swagger';

export class MetricsTotalsDto {
  @ApiProperty({ description: 'Total impressions across all campaigns', example: 1000000 })
  impressions: number;

  @ApiProperty({ description: 'Total clicks across all campaigns', example: 50000 })
  clicks: number;

  @ApiProperty({ description: 'Total conversions across all campaigns', example: 5000 })
  conversions: number;

  @ApiProperty({ description: 'Total spend across all campaigns in dollars', example: 100000.50 })
  spend: number;
}

export class MetricsAveragesDto {
  @ApiProperty({ description: 'Average click-through rate', example: 0.05 })
  ctr: number;

  @ApiProperty({ description: 'Average conversion rate', example: 0.10 })
  cvr: number;

  @ApiProperty({ description: 'Average cost per click in dollars', example: 2.00 })
  cpc: number;

  @ApiProperty({ description: 'Average cost per acquisition in dollars', example: 20.01 })
  cpa: number;
}

export class CampaignPerformanceDto {
  @ApiProperty({ description: 'Campaign ID', example: 'camp_123' })
  id: string;

  @ApiProperty({ description: 'Campaign name', example: 'Summer Sale 2025' })
  name: string;

  @ApiProperty({ description: 'Performance metric value', example: 0.08 })
  value: number;
}

export class BestPerformingDto {
  @ApiProperty({ 
    description: 'Best performing campaign by CTR',
    type: CampaignPerformanceDto,
    nullable: true 
  })
  byCTR: CampaignPerformanceDto | null;

  @ApiProperty({ 
    description: 'Best performing campaign by CVR',
    type: CampaignPerformanceDto,
    nullable: true 
  })
  byCVR: CampaignPerformanceDto | null;
}

export class WorstPerformingDto {
  @ApiProperty({ 
    description: 'Worst performing campaign by CTR',
    type: CampaignPerformanceDto,
    nullable: true 
  })
  byCTR: CampaignPerformanceDto | null;

  @ApiProperty({ 
    description: 'Worst performing campaign by CVR',
    type: CampaignPerformanceDto,
    nullable: true 
  })
  byCVR: CampaignPerformanceDto | null;
}

export class MetricsSummaryDto {
  @ApiProperty({ 
    description: 'Total metrics across all campaigns',
    type: MetricsTotalsDto 
  })
  totals: MetricsTotalsDto;

  @ApiProperty({ 
    description: 'Average metrics across all campaigns',
    type: MetricsAveragesDto 
  })
  averages: MetricsAveragesDto;

  @ApiProperty({ 
    description: 'Best performing campaigns',
    type: BestPerformingDto 
  })
  bestPerforming: BestPerformingDto;

  @ApiProperty({ 
    description: 'Worst performing campaigns',
    type: WorstPerformingDto 
  })
  worstPerforming: WorstPerformingDto;
}

