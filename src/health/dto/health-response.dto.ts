import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ 
    description: 'System uptime in human-readable format',
    example: '2d 5h 30m' 
  })
  uptime: string;

  @ApiProperty({ 
    description: '95th percentile latency in milliseconds',
    example: 150 
  })
  latencyP95: number;

  @ApiProperty({ 
    description: 'Error rate as a percentage (0-100)',
    example: 2.5 
  })
  errorRate: number;
}

