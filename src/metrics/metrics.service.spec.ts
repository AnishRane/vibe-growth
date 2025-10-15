import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CampaignWithKPIs } from '../campaigns/dto/campaign-response.interface';

describe('MetricsService', () => {
  let service: MetricsService;
  let campaignsService: CampaignsService;

  const mockCampaigns: CampaignWithKPIs[] = [
    {
      id: 'camp-1',
      name: 'Campaign 1',
      status: 'active',
      startDate: '2025-01-01',
      budget: 5000,
      stats: {
        impressions: 100000,
        clicks: 5000,
        conversions: 250,
        spend: 1000,
      },
      kpis: {
        ctr: 5.0,
        cvr: 5.0,
        cpc: 0.2,
        cpa: 4.0,
      },
    },
    {
      id: 'camp-2',
      name: 'Campaign 2',
      status: 'active',
      startDate: '2025-01-05',
      budget: 3000,
      stats: {
        impressions: 50000,
        clicks: 4000,
        conversions: 320,
        spend: 800,
      },
      kpis: {
        ctr: 8.0,
        cvr: 8.0,
        cpc: 0.2,
        cpa: 2.5,
      },
    },
    {
      id: 'camp-3',
      name: 'Campaign 3',
      status: 'paused',
      startDate: '2025-01-10',
      budget: 2000,
      stats: {
        impressions: 30000,
        clicks: 600,
        conversions: 30,
        spend: 300,
      },
      kpis: {
        ctr: 2.0,
        cvr: 5.0,
        cpc: 0.5,
        cpa: 10.0,
      },
    },
  ];

  const mockCampaignsService = {
    getAllCampaigns: jest.fn().mockReturnValue(mockCampaigns),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    campaignsService = module.get<CampaignsService>(CampaignsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return complete metrics summary', () => {
      const result = service.getSummary();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totals');
      expect(result).toHaveProperty('averages');
      expect(result).toHaveProperty('bestPerforming');
      expect(result).toHaveProperty('worstPerforming');
    });

    it('should calculate correct totals', () => {
      const result = service.getSummary();

      expect(result.totals.impressions).toBe(180000);
      expect(result.totals.clicks).toBe(9600);
      expect(result.totals.conversions).toBe(600);
      expect(result.totals.spend).toBe(2100);
    });

    it('should calculate correct averages', () => {
      const result = service.getSummary();

      // Average CTR: (5.0 + 8.0 + 2.0) / 3 = 5.0
      expect(result.averages.ctr).toBe(5.0);
      // Average CVR: (5.0 + 8.0 + 5.0) / 3 = 6.0
      expect(result.averages.cvr).toBe(6.0);
      // Average CPC: (0.2 + 0.2 + 0.5) / 3 = 0.3
      expect(result.averages.cpc).toBe(0.3);
      // Average CPA: (4.0 + 2.5 + 10.0) / 3 = 5.5
      expect(result.averages.cpa).toBe(5.5);
    });

    it('should identify best performing campaign by CTR', () => {
      const result = service.getSummary();

      expect(result.bestPerforming.byCTR).toBeDefined();
      expect(result.bestPerforming.byCTR?.id).toBe('camp-2');
      expect(result.bestPerforming.byCTR?.name).toBe('Campaign 2');
      expect(result.bestPerforming.byCTR?.value).toBe(8.0);
    });

    it('should identify best performing campaign by CVR', () => {
      const result = service.getSummary();

      expect(result.bestPerforming.byCVR).toBeDefined();
      expect(result.bestPerforming.byCVR?.id).toBe('camp-2');
      expect(result.bestPerforming.byCVR?.name).toBe('Campaign 2');
      expect(result.bestPerforming.byCVR?.value).toBe(8.0);
    });

    it('should identify worst performing campaign by CTR', () => {
      const result = service.getSummary();

      expect(result.worstPerforming.byCTR).toBeDefined();
      expect(result.worstPerforming.byCTR?.id).toBe('camp-3');
      expect(result.worstPerforming.byCTR?.name).toBe('Campaign 3');
      expect(result.worstPerforming.byCTR?.value).toBe(2.0);
    });

    it('should identify worst performing campaign by CVR', () => {
      const result = service.getSummary();

      expect(result.worstPerforming.byCVR).toBeDefined();
      expect(result.worstPerforming.byCVR?.id).toBe('camp-1');
      expect(result.worstPerforming.byCVR?.name).toBe('Campaign 1');
      expect(result.worstPerforming.byCVR?.value).toBe(5.0);
    });

    it('should handle empty campaigns array', () => {
      mockCampaignsService.getAllCampaigns.mockReturnValueOnce([]);

      const result = service.getSummary();

      expect(result.totals.impressions).toBe(0);
      expect(result.totals.clicks).toBe(0);
      expect(result.totals.conversions).toBe(0);
      expect(result.totals.spend).toBe(0);
      expect(result.averages.ctr).toBe(0);
      expect(result.averages.cvr).toBe(0);
      expect(result.averages.cpc).toBe(0);
      expect(result.averages.cpa).toBe(0);
      expect(result.bestPerforming.byCTR).toBeNull();
      expect(result.bestPerforming.byCVR).toBeNull();
      expect(result.worstPerforming.byCTR).toBeNull();
      expect(result.worstPerforming.byCVR).toBeNull();
    });

    it('should handle single campaign', () => {
      const singleCampaign = [mockCampaigns[0]];
      mockCampaignsService.getAllCampaigns.mockReturnValueOnce(singleCampaign);

      const result = service.getSummary();

      expect(result.totals.impressions).toBe(100000);
      expect(result.averages.ctr).toBe(5.0);
      expect(result.bestPerforming.byCTR?.id).toBe('camp-1');
      expect(result.worstPerforming.byCTR?.id).toBe('camp-1');
    });

    it('should call campaignsService.getAllCampaigns once', () => {
      service.getSummary();

      expect(campaignsService.getAllCampaigns).toHaveBeenCalledTimes(1);
    });

    it('should round averages to 2 decimal places', () => {
      const campaignsWithDecimals: CampaignWithKPIs[] = [
        {
          ...mockCampaigns[0],
          kpis: { ctr: 5.123, cvr: 4.567, cpc: 0.189, cpa: 3.999 },
        },
        {
          ...mockCampaigns[1],
          kpis: { ctr: 6.789, cvr: 5.432, cpc: 0.234, cpa: 4.111 },
        },
      ];
      mockCampaignsService.getAllCampaigns.mockReturnValueOnce(
        campaignsWithDecimals,
      );

      const result = service.getSummary();

      // (5.123 + 6.789) / 2 = 5.956 -> 5.96
      expect(result.averages.ctr).toBe(5.96);
      // (4.567 + 5.432) / 2 = 4.9995 -> 5.0
      expect(result.averages.cvr).toBe(5.0);
    });

    it('should accumulate totals correctly across multiple campaigns', () => {
      const result = service.getSummary();

      const expectedImpressions =
        mockCampaigns[0].stats.impressions +
        mockCampaigns[1].stats.impressions +
        mockCampaigns[2].stats.impressions;
      const expectedClicks =
        mockCampaigns[0].stats.clicks +
        mockCampaigns[1].stats.clicks +
        mockCampaigns[2].stats.clicks;
      const expectedConversions =
        mockCampaigns[0].stats.conversions +
        mockCampaigns[1].stats.conversions +
        mockCampaigns[2].stats.conversions;
      const expectedSpend =
        mockCampaigns[0].stats.spend +
        mockCampaigns[1].stats.spend +
        mockCampaigns[2].stats.spend;

      expect(result.totals.impressions).toBe(expectedImpressions);
      expect(result.totals.clicks).toBe(expectedClicks);
      expect(result.totals.conversions).toBe(expectedConversions);
      expect(result.totals.spend).toBe(expectedSpend);
    });
  });
});

