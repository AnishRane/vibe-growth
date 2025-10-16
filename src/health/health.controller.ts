import { Controller, Get, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  @Sse('stream')
  healthStream(): Observable<any> {
    return interval(10000).pipe(map(() => ({ data: this.healthService.getHealthMetrics() })));
  }


}
