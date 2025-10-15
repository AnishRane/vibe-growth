import { Injectable } from '@nestjs/common';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CampaignWithKPIs } from '../campaigns/dto/campaign-response.interface';

export interface MetricsSummary {
  totals: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
  averages: {
    ctr: number;
    cvr: number;
    cpc: number;
    cpa: number;
  };
  bestPerforming: {
    byCTR: CampaignPerformance | null;
    byCVR: CampaignPerformance | null;
  };
  worstPerforming: {
    byCTR: CampaignPerformance | null;
    byCVR: CampaignPerformance | null;
  };
}

export interface CampaignPerformance {
  id: string;
  name: string;
  value: number;
}

@Injectable()
export class MetricsService {
  constructor(private readonly campaignsService: CampaignsService) {}

  getSummary(): MetricsSummary {
    const campaigns = this.campaignsService.getAllCampaigns();
    
    // Calculate totals
    const totals = this.calculateTotals(campaigns);
    
    // Calculate averages
    const averages = this.calculateAverages(campaigns);
    
    // Find best and worst performers
    const bestPerforming = this.findBestPerformers(campaigns);
    const worstPerforming = this.findWorstPerformers(campaigns);

    return {
      totals,
      averages,
      bestPerforming,
      worstPerforming,
    };
  }

  private calculateTotals(campaigns: CampaignWithKPIs[]) {
    return campaigns.reduce(
      (acc, campaign) => {
        acc.impressions += campaign.stats.impressions;
        acc.clicks += campaign.stats.clicks;
        acc.conversions += campaign.stats.conversions;
        acc.spend += campaign.stats.spend;
        return acc;
      },
      { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
    );
  }

  private calculateAverages(campaigns: CampaignWithKPIs[]) {
    if (campaigns.length === 0) {
      return { ctr: 0, cvr: 0, cpc: 0, cpa: 0 };
    }

    const sum = campaigns.reduce(
      (acc, campaign) => {
        acc.ctr += campaign.kpis.ctr;
        acc.cvr += campaign.kpis.cvr;
        acc.cpc += campaign.kpis.cpc;
        acc.cpa += campaign.kpis.cpa;
        return acc;
      },
      { ctr: 0, cvr: 0, cpc: 0, cpa: 0 },
    );

    return {
      ctr: parseFloat((sum.ctr / campaigns.length).toFixed(2)),
      cvr: parseFloat((sum.cvr / campaigns.length).toFixed(2)),
      cpc: parseFloat((sum.cpc / campaigns.length).toFixed(2)),
      cpa: parseFloat((sum.cpa / campaigns.length).toFixed(2)),
    };
  }

  private findBestPerformers(campaigns: CampaignWithKPIs[]) {
    if (campaigns.length === 0) {
      return { byCTR: null, byCVR: null };
    }

    const byCTR = campaigns.reduce((best, campaign) =>
      campaign.kpis.ctr > best.kpis.ctr ? campaign : best,
    );

    const byCVR = campaigns.reduce((best, campaign) =>
      campaign.kpis.cvr > best.kpis.cvr ? campaign : best,
    );

    return {
      byCTR: {
        id: byCTR.id,
        name: byCTR.name,
        value: byCTR.kpis.ctr,
      },
      byCVR: {
        id: byCVR.id,
        name: byCVR.name,
        value: byCVR.kpis.cvr,
      },
    };
  }

  private findWorstPerformers(campaigns: CampaignWithKPIs[]) {
    if (campaigns.length === 0) {
      return { byCTR: null, byCVR: null };
    }

    const byCTR = campaigns.reduce((worst, campaign) =>
      campaign.kpis.ctr < worst.kpis.ctr ? campaign : worst,
    );

    const byCVR = campaigns.reduce((worst, campaign) =>
      campaign.kpis.cvr < worst.kpis.cvr ? campaign : worst,
    );

    return {
      byCTR: {
        id: byCTR.id,
        name: byCTR.name,
        value: byCTR.kpis.ctr,
      },
      byCVR: {
        id: byCVR.id,
        name: byCVR.name,
        value: byCVR.kpis.cvr,
      },
    };
  }
}

