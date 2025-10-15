import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Campaign,
  CampaignWithKPIs,
  CampaignKPIs,
} from './dto/campaign-response.interface';
import { GetCampaignsDto } from './dto/get-campaigns.dto';
import { PaginatedCampaignsResponse } from './dto/campaigns-response.dto';
import * as campaignsData from './mock/campaigns.json';

@Injectable()
export class CampaignsService {
  private campaigns: Campaign[] = campaignsData as Campaign[];

  /**
   * Calculate KPIs for a campaign
   */
  private calculateKPIs(campaign: Campaign): CampaignKPIs {
    const { impressions, clicks, conversions, spend } = campaign.stats;

    return {
      ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
      cvr: clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0,
      cpc: clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0,
      cpa: conversions > 0 ? Number((spend / conversions).toFixed(2)) : 0,
    };
  }

  /**
   * Convert Campaign to CampaignWithKPIs
   */
  private enrichCampaignWithKPIs(campaign: Campaign): CampaignWithKPIs {
    return {
      ...campaign,
      kpis: this.calculateKPIs(campaign),
    };
  }

  /**
   * Filter campaigns based on query parameters
   */
  private filterCampaigns(
    campaigns: Campaign[],
    filters: GetCampaignsDto,
  ): Campaign[] {
    let filtered = campaigns;

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(
        (campaign) => campaign.status === filters.status,
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const dateFrom = filters.dateFrom;
      filtered = filtered.filter(
        (campaign) => campaign.startDate >= dateFrom,
      );
    }

    if (filters.dateTo) {
      const dateTo = filters.dateTo;
      filtered = filtered.filter((campaign) => {
        // Check if campaign started before or on dateTo
        if (campaign.endDate) {
          return campaign.endDate <= dateTo;
        }
        // If no end date, check if start date is before dateTo
        return campaign.startDate <= dateTo;
      });
    }

    return filtered;
  }

  /**
   * Get paginated campaigns with filters and KPIs
   */
  getCampaigns(query: GetCampaignsDto): PaginatedCampaignsResponse {
    const { page = 1, limit = 10, ...filters } = query;

    // Apply filters
    const filteredCampaigns = this.filterCampaigns(this.campaigns, filters);

    // Calculate pagination
    const total = filteredCampaigns.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Get paginated slice
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    // Enrich with KPIs
    const campaignsWithKPIs = paginatedCampaigns.map((campaign) =>
      this.enrichCampaignWithKPIs(campaign),
    );

    return {
      data: campaignsWithKPIs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get a single campaign by ID with KPIs and metrics
   */
  getCampaignById(id: string): CampaignWithKPIs {
    const campaign = this.campaigns.find((c) => c.id === id);

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID "${id}" not found`);
    }

    return this.enrichCampaignWithKPIs(campaign);
  }

  /**
   * Get all campaigns (for internal use by other services)
   */
  getAllCampaigns(): CampaignWithKPIs[] {
    return this.campaigns.map((campaign) =>
      this.enrichCampaignWithKPIs(campaign),
    );
  }
}

