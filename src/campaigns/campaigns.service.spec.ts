import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';
import { GetCampaignsDto, CampaignStatus } from './dto/get-campaigns.dto';
import { NotFoundException } from '@nestjs/common';
import { Campaign } from './dto/campaign-response.interface';

describe('CampaignsService', () => {
  let service: CampaignsService;

  const mockCampaigns: Campaign[] = [
    {
      id: 'camp-1',
      name: 'Summer Sale 2025',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      budget: 5000,
      stats: {
        impressions: 100000,
        clicks: 5000,
        conversions: 250,
        spend: 1000,
      },
    },
    {
      id: 'camp-2',
      name: 'Winter Promo',
      status: 'active',
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      budget: 3000,
      stats: {
        impressions: 50000,
        clicks: 4000,
        conversions: 320,
        spend: 800,
      },
    },
    {
      id: 'camp-3',
      name: 'Old Campaign',
      status: 'completed',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      budget: 2000,
      stats: {
        impressions: 30000,
        clicks: 600,
        conversions: 30,
        spend: 300,
      },
    },
    {
      id: 'camp-4',
      name: 'Paused Test',
      status: 'paused',
      startDate: '2025-02-01',
      budget: 1000,
      stats: {
        impressions: 10000,
        clicks: 200,
        conversions: 10,
        spend: 100,
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignsService],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    // Reset the campaigns data to mockCampaigns
    (service as any).campaigns = [...mockCampaigns];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCampaigns', () => {
    it('should return all campaigns with default pagination', () => {
      const query: GetCampaignsDto = {};
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(4);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(4);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should calculate KPIs for all campaigns', () => {
      const query: GetCampaignsDto = {};
      const result = service.getCampaigns(query);

      result.data.forEach((campaign) => {
        expect(campaign).toHaveProperty('kpis');
        expect(campaign.kpis).toHaveProperty('ctr');
        expect(campaign.kpis).toHaveProperty('cvr');
        expect(campaign.kpis).toHaveProperty('cpc');
        expect(campaign.kpis).toHaveProperty('cpa');
      });
    });

    it('should calculate correct CTR', () => {
      const query: GetCampaignsDto = {};
      const result = service.getCampaigns(query);

      const campaign = result.data[0];
      const expectedCTR = Number(
        ((campaign.stats.clicks / campaign.stats.impressions) * 100).toFixed(2),
      );
      expect(campaign.kpis.ctr).toBe(expectedCTR);
    });

    it('should calculate correct CVR', () => {
      const query: GetCampaignsDto = {};
      const result = service.getCampaigns(query);

      const campaign = result.data[0];
      const expectedCVR = Number(
        ((campaign.stats.conversions / campaign.stats.clicks) * 100).toFixed(2),
      );
      expect(campaign.kpis.cvr).toBe(expectedCVR);
    });

    it('should calculate correct CPC', () => {
      const query: GetCampaignsDto = {};
      const result = service.getCampaigns(query);

      const campaign = result.data[0];
      const expectedCPC = Number(
        (campaign.stats.spend / campaign.stats.clicks).toFixed(2),
      );
      expect(campaign.kpis.cpc).toBe(expectedCPC);
    });

    it('should calculate correct CPA', () => {
      const query: GetCampaignsDto = {};
      const result = service.getCampaigns(query);

      const campaign = result.data[0];
      const expectedCPA = Number(
        (campaign.stats.spend / campaign.stats.conversions).toFixed(2),
      );
      expect(campaign.kpis.cpa).toBe(expectedCPA);
    });

    it('should handle zero impressions (CTR)', () => {
      (service as any).campaigns = [
        {
          id: 'test',
          name: 'Test',
          status: 'active',
          startDate: '2025-01-01',
          budget: 100,
          stats: { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
        },
      ];

      const result = service.getCampaigns({});
      expect(result.data[0].kpis.ctr).toBe(0);
    });

    it('should handle zero clicks (CVR, CPC)', () => {
      (service as any).campaigns = [
        {
          id: 'test',
          name: 'Test',
          status: 'active',
          startDate: '2025-01-01',
          budget: 100,
          stats: { impressions: 1000, clicks: 0, conversions: 0, spend: 10 },
        },
      ];

      const result = service.getCampaigns({});
      expect(result.data[0].kpis.cvr).toBe(0);
      expect(result.data[0].kpis.cpc).toBe(0);
    });

    it('should handle zero conversions (CPA)', () => {
      (service as any).campaigns = [
        {
          id: 'test',
          name: 'Test',
          status: 'active',
          startDate: '2025-01-01',
          budget: 100,
          stats: { impressions: 1000, clicks: 50, conversions: 0, spend: 10 },
        },
      ];

      const result = service.getCampaigns({});
      expect(result.data[0].kpis.cpa).toBe(0);
    });

    it('should filter by status', () => {
      const query: GetCampaignsDto = { status: CampaignStatus.ACTIVE };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(2);
      result.data.forEach((campaign) => {
        expect(campaign.status).toBe('active');
      });
    });

    it('should filter by paused status', () => {
      const query: GetCampaignsDto = { status: CampaignStatus.PAUSED };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('paused');
    });

    it('should filter by completed status', () => {
      const query: GetCampaignsDto = { status: CampaignStatus.COMPLETED };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('completed');
    });

    it('should filter by dateFrom', () => {
      const query: GetCampaignsDto = { dateFrom: '2025-01-10' };
      const result = service.getCampaigns(query);

      result.data.forEach((campaign) => {
        expect(campaign.startDate >= '2025-01-10').toBe(true);
      });
    });

    it('should filter by dateTo', () => {
      const query: GetCampaignsDto = { dateTo: '2025-01-10' };
      const result = service.getCampaigns(query);

      result.data.forEach((campaign) => {
        if (campaign.endDate) {
          expect(campaign.endDate <= '2025-01-10').toBe(true);
        } else {
          expect(campaign.startDate <= '2025-01-10').toBe(true);
        }
      });
    });

    it('should filter by date range', () => {
      const query: GetCampaignsDto = {
        dateFrom: '2025-01-01',
        dateTo: '2025-03-31',
      };
      const result = service.getCampaigns(query);

      // Should include campaigns that start in range and end within range
      result.data.forEach((campaign) => {
        expect(campaign.startDate >= '2025-01-01').toBe(true);
        if (campaign.endDate) {
          expect(campaign.endDate <= '2025-03-31').toBe(true);
        }
      });
    });

    it('should handle pagination - page 1', () => {
      const query: GetCampaignsDto = { page: 1, limit: 2 };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(4);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should handle pagination - page 2', () => {
      const query: GetCampaignsDto = { page: 2, limit: 2 };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(2);
      expect(result.data[0].id).toBe('camp-3');
    });

    it('should handle last page with fewer items', () => {
      const query: GetCampaignsDto = { page: 2, limit: 3 };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should return empty array for out-of-range page', () => {
      const query: GetCampaignsDto = { page: 10, limit: 10 };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.page).toBe(10);
    });

    it('should combine status and date filters', () => {
      const query: GetCampaignsDto = {
        status: CampaignStatus.ACTIVE,
        dateFrom: '2025-01-01',
      };
      const result = service.getCampaigns(query);

      result.data.forEach((campaign) => {
        expect(campaign.status).toBe('active');
        expect(campaign.startDate >= '2025-01-01').toBe(true);
      });
    });

    it('should calculate totalPages correctly', () => {
      const query: GetCampaignsDto = { limit: 3 };
      const result = service.getCampaigns(query);

      expect(result.pagination.totalPages).toBe(2); // 4 items / 3 per page = 2 pages
    });

    it('should use default values for page and limit', () => {
      const result = service.getCampaigns({});

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should handle empty result set', () => {
      const query: GetCampaignsDto = { status: CampaignStatus.ACTIVE, dateFrom: '2030-01-01' };
      const result = service.getCampaigns(query);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('getCampaignById', () => {
    it('should return campaign by ID', () => {
      const result = service.getCampaignById('camp-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('camp-1');
      expect(result.name).toBe('Summer Sale 2025');
    });

    it('should return campaign with KPIs', () => {
      const result = service.getCampaignById('camp-1');

      expect(result).toHaveProperty('kpis');
      expect(result.kpis).toHaveProperty('ctr');
      expect(result.kpis).toHaveProperty('cvr');
      expect(result.kpis).toHaveProperty('cpc');
      expect(result.kpis).toHaveProperty('cpa');
    });

    it('should throw NotFoundException for non-existent ID', () => {
      expect(() => service.getCampaignById('non-existent')).toThrow(
        NotFoundException,
      );
      expect(() => service.getCampaignById('non-existent')).toThrow(
        'Campaign with ID "non-existent" not found',
      );
    });

    it('should calculate KPIs correctly', () => {
      const result = service.getCampaignById('camp-1');
      const campaign = mockCampaigns[0];

      const expectedCTR = Number(
        ((campaign.stats.clicks / campaign.stats.impressions) * 100).toFixed(2),
      );
      const expectedCVR = Number(
        ((campaign.stats.conversions / campaign.stats.clicks) * 100).toFixed(2),
      );
      const expectedCPC = Number(
        (campaign.stats.spend / campaign.stats.clicks).toFixed(2),
      );
      const expectedCPA = Number(
        (campaign.stats.spend / campaign.stats.conversions).toFixed(2),
      );

      expect(result.kpis.ctr).toBe(expectedCTR);
      expect(result.kpis.cvr).toBe(expectedCVR);
      expect(result.kpis.cpc).toBe(expectedCPC);
      expect(result.kpis.cpa).toBe(expectedCPA);
    });

    it('should return different campaigns by ID', () => {
      const result1 = service.getCampaignById('camp-1');
      const result2 = service.getCampaignById('camp-2');

      expect(result1.id).toBe('camp-1');
      expect(result2.id).toBe('camp-2');
      expect(result1.id).not.toBe(result2.id);
    });

    it('should preserve all campaign properties', () => {
      const result = service.getCampaignById('camp-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('budget');
      expect(result).toHaveProperty('stats');
    });
  });

  describe('getAllCampaigns', () => {
    it('should return all campaigns with KPIs', () => {
      const result = service.getAllCampaigns();

      expect(result).toHaveLength(4);
      result.forEach((campaign) => {
        expect(campaign).toHaveProperty('kpis');
      });
    });

    it('should calculate KPIs for all campaigns', () => {
      const result = service.getAllCampaigns();

      result.forEach((campaign) => {
        expect(campaign.kpis).toHaveProperty('ctr');
        expect(campaign.kpis).toHaveProperty('cvr');
        expect(campaign.kpis).toHaveProperty('cpc');
        expect(campaign.kpis).toHaveProperty('cpa');
        expect(typeof campaign.kpis.ctr).toBe('number');
        expect(typeof campaign.kpis.cvr).toBe('number');
        expect(typeof campaign.kpis.cpc).toBe('number');
        expect(typeof campaign.kpis.cpa).toBe('number');
      });
    });

    it('should not filter campaigns', () => {
      const result = service.getAllCampaigns();
      expect(result.length).toBe(mockCampaigns.length);
    });

    it('should return campaigns in original order', () => {
      const result = service.getAllCampaigns();

      expect(result[0].id).toBe('camp-1');
      expect(result[1].id).toBe('camp-2');
      expect(result[2].id).toBe('camp-3');
      expect(result[3].id).toBe('camp-4');
    });
  });
});

