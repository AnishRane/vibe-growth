import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get system health metrics',
    description: 'Retrieve current system health information including uptime, latency percentiles, and error rates. This endpoint monitors the last 100 requests to provide real-time health insights.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved health metrics',
    type: HealthResponseDto
  })
  getHealth(): HealthResponseDto {
    return this.healthService.getHealthMetrics();
  }
}
