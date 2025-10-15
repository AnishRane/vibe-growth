export interface CampaignStats {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  budget: number;
  stats: CampaignStats;
  dailyMetrics?: DailyMetric[];
}

export interface CampaignKPIs {
  ctr: number;
  cvr: number;
  cpc: number;
  cpa: number;
}

export interface CampaignWithKPIs extends Campaign {
  kpis: CampaignKPIs;
}

