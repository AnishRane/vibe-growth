import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { GetCampaignsDto } from './dto/get-campaigns.dto';
import { PaginatedCampaignsResponse } from './dto/campaigns-response.dto';
import { CampaignWithKPIs } from './dto/campaign-response.interface';

@ApiTags('campaigns')
@ApiSecurity('x-api-key')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all campaigns',
    description: 'Retrieve a paginated list of campaigns with optional filters for status and date range. Each campaign includes calculated KPIs such as CTR, CVR, CPC, and CPA.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved campaigns',
    type: PaginatedCampaignsResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid query parameters' 
  })
  getCampaigns(@Query() query: GetCampaignsDto): PaginatedCampaignsResponse {
    return this.campaignsService.getCampaigns(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get campaign by ID',
    description: 'Retrieve detailed information about a specific campaign including stats, daily metrics, and calculated KPIs.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique campaign identifier',
    example: 'camp_123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved campaign',
    type: CampaignWithKPIs
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Campaign not found' 
  })
  getCampaignById(@Param('id') id: string): CampaignWithKPIs {
    return this.campaignsService.getCampaignById(id);
  }
}

