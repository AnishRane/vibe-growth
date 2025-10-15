import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatus } from '../../campaigns/dto/get-campaigns.dto';
import { CampaignWithKPIs } from '../../campaigns/dto/campaign-response.interface';

export class IntentQueryDto {
  @ApiProperty({
    description: 'Natural language query to search and filter campaigns',
    example: 'Show me active campaigns from last month sorted by CTR',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

export type SortByField = 'ctr' | 'cvr' | 'cpc' | 'cpa' | 'spend';
export type SortOrder = 'asc' | 'desc';

export class ParsedIntent {
  @ApiProperty({ 
    description: 'Parsed campaign status filter',
    enum: CampaignStatus,
    required: false,
    example: CampaignStatus.ACTIVE
  })
  status?: CampaignStatus;

  @ApiProperty({ 
    description: 'Parsed start date filter (ISO 8601 format)',
    required: false,
    example: '2025-09-01'
  })
  dateFrom?: string;

  @ApiProperty({ 
    description: 'Parsed end date filter (ISO 8601 format)',
    required: false,
    example: '2025-09-30'
  })
  dateTo?: string;

  @ApiProperty({ 
    description: 'Field to sort by',
    enum: ['ctr', 'cvr', 'cpc', 'cpa', 'spend'],
    required: false,
    example: 'ctr'
  })
  sortBy?: SortByField;

  @ApiProperty({ 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
    example: 'desc'
  })
  sortOrder?: SortOrder;

  @ApiProperty({ 
    description: 'Number of results to return',
    required: false,
    example: 10
  })
  limit?: number;
}

export class IntentResponseDto {
  @ApiProperty({ 
    description: 'Parsed intent from the natural language query',
    type: ParsedIntent
  })
  intent: ParsedIntent;

  @ApiProperty({ 
    description: 'Campaigns matching the parsed intent',
    type: [CampaignWithKPIs]
  })
  campaigns: CampaignWithKPIs[];

  @ApiProperty({ 
    description: 'Optional message about the query processing',
    required: false,
    example: 'Found 5 active campaigns from September 2025'
  })
  message?: string;
}

