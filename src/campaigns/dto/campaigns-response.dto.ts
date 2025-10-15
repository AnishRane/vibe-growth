import { ApiProperty } from '@nestjs/swagger';
import { CampaignWithKPIs } from './campaign-response.interface';

export class PaginationInfo {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

export class PaginatedCampaignsResponse {
  @ApiProperty({ 
    description: 'Array of campaigns with calculated KPIs', 
    type: [CampaignWithKPIs] 
  })
  data: CampaignWithKPIs[];

  @ApiProperty({ 
    description: 'Pagination information', 
    type: PaginationInfo 
  })
  pagination: PaginationInfo;
}

