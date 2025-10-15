import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { GetCampaignsDto, CampaignStatus } from './dto/get-campaigns.dto';
import { NotFoundException } from '@nestjs/common';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let service: CampaignsService;

  const mockCampaignsResponse = {
    data: [
      {
        id: 'camp-1',
        name: 'Campaign 1',
        status: 'active' as const,
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
        status: 'active' as const,
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
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
  };

  const mockSingleCampaign = mockCampaignsResponse.data[0];

  const mockCampaignsService = {
    getCampaigns: jest.fn().mockReturnValue(mockCampaignsResponse),
    getCampaignById: jest.fn().mockReturnValue(mockSingleCampaign),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
    service = module.get<CampaignsService>(CampaignsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCampaigns', () => {
    it('should return paginated campaigns', () => {
      const query: GetCampaignsDto = {};
      const result = controller.getCampaigns(query);

      expect(result).toEqual(mockCampaignsResponse);
      expect(service.getCampaigns).toHaveBeenCalledWith(query);
      expect(service.getCampaigns).toHaveBeenCalledTimes(1);
    });

    it('should return campaigns with correct structure', () => {
      const query: GetCampaignsDto = {};
      const result = controller.getCampaigns(query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return pagination metadata', () => {
      const query: GetCampaignsDto = {};
      const result = controller.getCampaigns(query);

      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('totalPages');
      expect(typeof result.pagination.page).toBe('number');
      expect(typeof result.pagination.limit).toBe('number');
      expect(typeof result.pagination.total).toBe('number');
      expect(typeof result.pagination.totalPages).toBe('number');
    });

    it('should accept status filter', () => {
      const query: GetCampaignsDto = { status: CampaignStatus.ACTIVE };
      controller.getCampaigns(query);

      expect(service.getCampaigns).toHaveBeenCalledWith(
        expect.objectContaining({ status: CampaignStatus.ACTIVE }),
      );
    });

    it('should accept date filters', () => {
      const query: GetCampaignsDto = {
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };
      controller.getCampaigns(query);

      expect(service.getCampaigns).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
        }),
      );
    });

    it('should accept pagination parameters', () => {
      const query: GetCampaignsDto = { page: 2, limit: 5 };
      controller.getCampaigns(query);

      expect(service.getCampaigns).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 5 }),
      );
    });

    it('should handle combined filters', () => {
      const query: GetCampaignsDto = {
        status: CampaignStatus.ACTIVE,
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        page: 1,
        limit: 10,
      };
      controller.getCampaigns(query);

      expect(service.getCampaigns).toHaveBeenCalledWith(query);
    });

    it('should return campaigns with KPIs', () => {
      const query: GetCampaignsDto = {};
      const result = controller.getCampaigns(query);

      result.data.forEach((campaign) => {
        expect(campaign).toHaveProperty('kpis');
        expect(campaign.kpis).toHaveProperty('ctr');
        expect(campaign.kpis).toHaveProperty('cvr');
        expect(campaign.kpis).toHaveProperty('cpc');
        expect(campaign.kpis).toHaveProperty('cpa');
      });
    });

    it('should return campaigns with stats', () => {
      const query: GetCampaignsDto = {};
      const result = controller.getCampaigns(query);

      result.data.forEach((campaign) => {
        expect(campaign).toHaveProperty('stats');
        expect(campaign.stats).toHaveProperty('impressions');
        expect(campaign.stats).toHaveProperty('clicks');
        expect(campaign.stats).toHaveProperty('conversions');
        expect(campaign.stats).toHaveProperty('spend');
      });
    });

    it('should return campaigns with basic info', () => {
      const query: GetCampaignsDto = {};
      const result = controller.getCampaigns(query);

      result.data.forEach((campaign) => {
        expect(campaign).toHaveProperty('id');
        expect(campaign).toHaveProperty('name');
        expect(campaign).toHaveProperty('status');
        expect(campaign).toHaveProperty('startDate');
        expect(campaign).toHaveProperty('budget');
      });
    });

    it('should handle empty results', () => {
      const emptyResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockCampaignsService.getCampaigns.mockReturnValueOnce(emptyResponse);

      const query: GetCampaignsDto = { status: CampaignStatus.COMPLETED };
      const result = controller.getCampaigns(query);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should pass all query parameters to service', () => {
      const query: GetCampaignsDto = {
        status: CampaignStatus.PAUSED,
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        page: 3,
        limit: 20,
      };
      controller.getCampaigns(query);

      expect(service.getCampaigns).toHaveBeenCalledWith(query);
    });
  });

  describe('getCampaignById', () => {
    it('should return a single campaign by ID', () => {
      const result = controller.getCampaignById('camp-1');

      expect(result).toEqual(mockSingleCampaign);
      expect(service.getCampaignById).toHaveBeenCalledWith('camp-1');
      expect(service.getCampaignById).toHaveBeenCalledTimes(1);
    });

    it('should return campaign with KPIs', () => {
      const result = controller.getCampaignById('camp-1');

      expect(result).toHaveProperty('kpis');
      expect(result.kpis).toHaveProperty('ctr');
      expect(result.kpis).toHaveProperty('cvr');
      expect(result.kpis).toHaveProperty('cpc');
      expect(result.kpis).toHaveProperty('cpa');
    });

    it('should return campaign with stats', () => {
      const result = controller.getCampaignById('camp-1');

      expect(result).toHaveProperty('stats');
      expect(result.stats).toHaveProperty('impressions');
      expect(result.stats).toHaveProperty('clicks');
      expect(result.stats).toHaveProperty('conversions');
      expect(result.stats).toHaveProperty('spend');
    });

    it('should return campaign with basic info', () => {
      const result = controller.getCampaignById('camp-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('budget');
      expect(result.id).toBe('camp-1');
    });

    it('should throw NotFoundException for non-existent ID', () => {
      mockCampaignsService.getCampaignById.mockImplementationOnce(() => {
        throw new NotFoundException('Campaign with ID "invalid-id" not found');
      });

      expect(() => controller.getCampaignById('invalid-id')).toThrow(
        NotFoundException,
      );
    });

    it('should handle different campaign IDs', () => {
      const campaign2 = mockCampaignsResponse.data[1];
      mockCampaignsService.getCampaignById.mockReturnValueOnce(campaign2);

      const result = controller.getCampaignById('camp-2');

      expect(result.id).toBe('camp-2');
      expect(service.getCampaignById).toHaveBeenCalledWith('camp-2');
    });

    it('should return campaign with correct data types', () => {
      const result = controller.getCampaignById('camp-1');

      expect(typeof result.id).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.status).toBe('string');
      expect(typeof result.startDate).toBe('string');
      expect(typeof result.budget).toBe('number');
      expect(typeof result.stats.impressions).toBe('number');
      expect(typeof result.kpis.ctr).toBe('number');
    });

    it('should include all KPI metrics', () => {
      const result = controller.getCampaignById('camp-1');

      expect(result.kpis.ctr).toBeDefined();
      expect(result.kpis.cvr).toBeDefined();
      expect(result.kpis.cpc).toBeDefined();
      expect(result.kpis.cpa).toBeDefined();
    });

    it('should include all stats metrics', () => {
      const result = controller.getCampaignById('camp-1');

      expect(result.stats.impressions).toBeDefined();
      expect(result.stats.clicks).toBeDefined();
      expect(result.stats.conversions).toBeDefined();
      expect(result.stats.spend).toBeDefined();
    });
  });
});

