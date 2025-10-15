import { Controller, Get, Param, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { GetCampaignsDto } from './dto/get-campaigns.dto';
import { PaginatedCampaignsResponse } from './dto/campaigns-response.dto';
import { CampaignWithKPIs } from './dto/campaign-response.interface';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  getCampaigns(@Query() query: GetCampaignsDto): PaginatedCampaignsResponse {
    return this.campaignsService.getCampaigns(query);
  }

  @Get(':id')
  getCampaignById(@Param('id') id: string): CampaignWithKPIs {
    return this.campaignsService.getCampaignById(id);
  }
}

