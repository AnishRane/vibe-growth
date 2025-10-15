import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { MetricsSummaryDto } from './dto/metrics-summary.dto';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('summary')
  @ApiOperation({ 
    summary: 'Get campaign metrics summary',
    description: 'Retrieve aggregated metrics across all campaigns including totals, averages, and best/worst performing campaigns by CTR and CVR.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved metrics summary',
    type: MetricsSummaryDto
  })
  getSummary(): MetricsSummaryDto {
    return this.metricsService.getSummary();
  }
}

