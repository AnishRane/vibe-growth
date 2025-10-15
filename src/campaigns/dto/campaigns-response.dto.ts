import { CampaignWithKPIs } from './campaign-response.interface';

export class PaginatedCampaignsResponse {
  data: CampaignWithKPIs[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

