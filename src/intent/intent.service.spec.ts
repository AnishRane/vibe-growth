import { Test, TestingModule } from '@nestjs/testing';
import { IntentService } from './intent.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { BadRequestException } from '@nestjs/common';
import { CampaignStatus } from '../campaigns/dto/get-campaigns.dto';

describe('IntentService', () => {
  let service: IntentService;
  let campaignsService: CampaignsService;

  const mockCampaigns = {
    data: [
      {
        id: 'camp-1',
        name: 'Campaign 1',
        status: 'active',
        startDate: '2025-01-01',
        budget: 5000,
        stats: { impressions: 100000, clicks: 5000, conversions: 250, spend: 1000 },
        kpis: { ctr: 5.0, cvr: 5.0, cpc: 0.2, cpa: 4.0 },
      },
      {
        id: 'camp-2',
        name: 'Campaign 2',
        status: 'active',
        startDate: '2025-01-05',
        budget: 3000,
        stats: { impressions: 50000, clicks: 4000, conversions: 320, spend: 800 },
        kpis: { ctr: 8.0, cvr: 8.0, cpc: 0.2, cpa: 2.5 },
      },
      {
        id: 'camp-3',
        name: 'Campaign 3',
        status: 'paused',
        startDate: '2025-01-10',
        budget: 2000,
        stats: { impressions: 30000, clicks: 600, conversions: 30, spend: 300 },
        kpis: { ctr: 2.0, cvr: 5.0, cpc: 0.5, cpa: 10.0 },
      },
    ],
    pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
  };

  const mockCampaignsService = {
    getCampaigns: jest.fn().mockResolvedValue(mockCampaigns),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentService,
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
      ],
    }).compile();

    service = module.get<IntentService>(IntentService);
    campaignsService = module.get<CampaignsService>(CampaignsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parsePrompt', () => {
    describe('status parsing', () => {
      it('should parse "active" status', () => {
        const result = service.parsePrompt('Show me active campaigns');
        expect(result.status).toBe(CampaignStatus.ACTIVE);
      });

      it('should parse "paused" status', () => {
        const result = service.parsePrompt('Show me paused campaigns');
        expect(result.status).toBe(CampaignStatus.PAUSED);
      });

      it('should parse "completed" status', () => {
        const result = service.parsePrompt('Show me completed campaigns');
        expect(result.status).toBe(CampaignStatus.COMPLETED);
      });

      it('should handle no status in prompt', () => {
        const result = service.parsePrompt('Show me campaigns');
        expect(result.status).toBeUndefined();
      });
    });

    describe('date filtering', () => {
      beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-10-15T00:00:00'));
      });

      afterAll(() => {
        jest.useRealTimers();
      });

      it('should parse "today"', () => {
        const result = service.parsePrompt('campaigns from today');
        expect(result.dateFrom).toBe('2025-10-14');
        expect(result.dateTo).toBe('2025-10-14');
      });

      it('should parse "yesterday"', () => {
        const result = service.parsePrompt('campaigns from yesterday');
        expect(result.dateFrom).toBe('2025-10-13');
        expect(result.dateTo).toBe('2025-10-13');
      });

      it('should parse "last 7 days"', () => {
        const result = service.parsePrompt('campaigns from last 7 days');
        expect(result.dateFrom).toBe('2025-10-07');
        expect(result.dateTo).toBe('2025-10-14');
      });

      it('should parse "last 30 days"', () => {
        const result = service.parsePrompt('campaigns from last 30 days');
        expect(result.dateFrom).toBe('2025-09-14');
        expect(result.dateTo).toBe('2025-10-14');
      });

      it('should parse "this week"', () => {
        // Oct 15, 2025 is Wednesday. Week starts Monday (Oct 13)
        const result = service.parsePrompt('campaigns from this week');
        expect(result.dateFrom).toBe('2025-10-12');
        expect(result.dateTo).toBe('2025-10-14');
      });

      it('should parse "last week"', () => {
        const result = service.parsePrompt('campaigns from last week');
        expect(result.dateFrom).toBe('2025-10-05');
        expect(result.dateTo).toBe('2025-10-11');
      });

      it('should parse "this month"', () => {
        const result = service.parsePrompt('campaigns from this month');
        // Should be the first day of current month
        expect(result.dateFrom).toMatch(/2025-(09|10)-\d{2}/);
        expect(result.dateTo).toMatch(/2025-10-\d{2}/);
      });

      it('should parse "last month"', () => {
        const result = service.parsePrompt('campaigns from last month');
        // Should be September 2025
        expect(result.dateFrom).toMatch(/2025-(08|09)-\d{2}/);
        expect(result.dateTo).toMatch(/2025-(09|10)-\d{2}/);
      });

      it('should parse "this year"', () => {
        const result = service.parsePrompt('campaigns from this year');
        // Should be January 1st of current year
        expect(result.dateFrom).toMatch(/202[45]-\d{2}-\d{2}/);
        expect(result.dateTo).toMatch(/2025-10-\d{2}/);
      });

      it('should handle "last 1 day" (singular)', () => {
        const result = service.parsePrompt('campaigns from last 1 day');
        expect(result.dateFrom).toBe('2025-10-13');
        expect(result.dateTo).toBe('2025-10-14');
      });
    });

    describe('sorting', () => {
      it('should parse CTR sorting with "top"', () => {
        const result = service.parsePrompt('top campaigns by CTR');
        expect(result.sortBy).toBe('ctr');
        expect(result.sortOrder).toBe('desc');
      });

      it('should parse CVR sorting with "best"', () => {
        const result = service.parsePrompt('best campaigns by conversion rate');
        expect(result.sortBy).toBe('cvr');
        expect(result.sortOrder).toBe('desc');
      });

      it('should parse CPC sorting with "worst"', () => {
        const result = service.parsePrompt('worst campaigns by cost per click');
        expect(result.sortBy).toBe('cpc');
        expect(result.sortOrder).toBe('asc');
      });

      it('should parse CPA sorting with "lowest"', () => {
        const result = service.parsePrompt('lowest campaigns by CPA');
        expect(result.sortBy).toBe('cpa');
        expect(result.sortOrder).toBe('asc');
      });

      it('should parse spend sorting', () => {
        const result = service.parsePrompt('top campaigns by spend');
        expect(result.sortBy).toBe('spend');
        expect(result.sortOrder).toBe('desc');
      });

      it('should parse "click-through" as CTR', () => {
        const result = service.parsePrompt('top by click-through');
        expect(result.sortBy).toBe('ctr');
      });

      it('should parse "click through" (no hyphen) as CTR', () => {
        const result = service.parsePrompt('top by click through');
        expect(result.sortBy).toBe('ctr');
      });

      it('should parse "cost per acquisition" as CPA', () => {
        const result = service.parsePrompt('top by cost per acquisition');
        expect(result.sortBy).toBe('cpa');
      });

      it('should parse "cost per conversion" as CPA', () => {
        const result = service.parsePrompt('top by cost per conversion');
        expect(result.sortBy).toBe('cpa');
      });

      it('should parse "bottom" as ascending order', () => {
        const result = service.parsePrompt('bottom campaigns by CTR');
        expect(result.sortOrder).toBe('asc');
      });

      it('should parse "highest" as descending order', () => {
        const result = service.parsePrompt('highest CTR campaigns');
        expect(result.sortOrder).toBe('desc');
      });
    });

    describe('limit parsing', () => {
      it('should parse "top 5"', () => {
        const result = service.parsePrompt('top 5 campaigns');
        expect(result.limit).toBe(5);
      });

      it('should parse "top 10"', () => {
        const result = service.parsePrompt('show me top 10 campaigns');
        expect(result.limit).toBe(10);
      });

      it('should parse "worst 3"', () => {
        const result = service.parsePrompt('worst 3 campaigns');
        expect(result.limit).toBe(3);
      });

      it('should parse "bottom 7"', () => {
        const result = service.parsePrompt('bottom 7 campaigns');
        expect(result.limit).toBe(7);
      });

      it('should parse "lowest 2"', () => {
        const result = service.parsePrompt('lowest 2 campaigns');
        expect(result.limit).toBe(2);
      });

      it('should handle no limit', () => {
        const result = service.parsePrompt('show campaigns');
        expect(result.limit).toBeUndefined();
      });
    });

    describe('complex prompts', () => {
      beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-10-15T00:00:00'));
      });

      afterAll(() => {
        jest.useRealTimers();
      });

      it('should parse multi-filter prompt', () => {
        const result = service.parsePrompt('top 5 active campaigns from last week by CTR');
        expect(result.status).toBe(CampaignStatus.ACTIVE);
        expect(result.dateFrom).toBeDefined();
        expect(result.dateTo).toBeDefined();
        expect(result.sortBy).toBe('ctr');
        expect(result.sortOrder).toBe('desc');
        expect(result.limit).toBe(5);
      });

      it('should handle case insensitivity', () => {
        const result = service.parsePrompt('TOP 5 ACTIVE CAMPAIGNS BY CTR');
        expect(result.status).toBe(CampaignStatus.ACTIVE);
        expect(result.sortBy).toBe('ctr');
        expect(result.limit).toBe(5);
      });

      it('should handle extra whitespace', () => {
        const result = service.parsePrompt('   show top 5 active campaigns   ');
        expect(result.status).toBe(CampaignStatus.ACTIVE);
        expect(result.limit).toBe(5);
        expect(result.sortOrder).toBe('desc');
      });
    });
  });

  describe('queryCampaigns', () => {
    it('should query campaigns with parsed intent', async () => {
      const result = await service.queryCampaigns('Show me active campaigns');

      expect(campaignsService.getCampaigns).toHaveBeenCalledWith({
        status: CampaignStatus.ACTIVE,
        dateFrom: undefined,
        dateTo: undefined,
        page: 1,
        limit: 10,
      });
      expect(result.campaigns).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should apply sorting when specified', async () => {
      const result = await service.queryCampaigns('top 2 campaigns by CTR');

      expect(result.campaigns).toHaveLength(2);
      // Should be sorted by CTR descending
      expect(result.campaigns[0].kpis.ctr).toBeGreaterThanOrEqual(
        result.campaigns[1].kpis.ctr,
      );
    });

    it('should apply limit after sorting', async () => {
      const result = await service.queryCampaigns('top 1 campaigns by CVR');

      expect(result.campaigns).toHaveLength(1);
      expect(result.campaigns[0].id).toBe('camp-2'); // Highest CVR
    });

    it('should sort ascending for "worst"', async () => {
      const result = await service.queryCampaigns('worst 2 campaigns by CTR');

      expect(result.campaigns).toHaveLength(2);
      expect(result.campaigns[0].kpis.ctr).toBeLessThanOrEqual(
        result.campaigns[1].kpis.ctr,
      );
    });

    it('should throw BadRequestException for invalid prompt', async () => {
      await expect(
        service.queryCampaigns('random gibberish text'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with hints', async () => {
      try {
        await service.queryCampaigns('invalid prompt');
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toContain('Unable to parse your prompt');
        expect(error.response.hints).toBeDefined();
        expect(Array.isArray(error.response.hints)).toBe(true);
        expect(error.response.hints.length).toBeGreaterThan(0);
      }
    });

    it('should accept prompt with only status', async () => {
      const result = await service.queryCampaigns('active campaigns');

      expect(result.intent.status).toBe(CampaignStatus.ACTIVE);
      expect(result.campaigns).toBeDefined();
    });

    it('should accept prompt with only date filter', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-15T00:00:00'));

      const result = await service.queryCampaigns('campaigns from today');

      expect(result.intent.dateFrom).toBeDefined();
      expect(result.campaigns).toBeDefined();

      jest.useRealTimers();
    });

    it('should accept prompt with only sorting', async () => {
      const result = await service.queryCampaigns('top campaigns by CTR');

      expect(result.intent.sortBy).toBe('ctr');
      expect(result.campaigns).toBeDefined();
    });


    it('should handle no campaigns found', async () => {
      mockCampaignsService.getCampaigns.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      const result = await service.queryCampaigns('completed campaigns');

      expect(result.campaigns).toHaveLength(0);
      expect(result.message).toBe('No campaigns found matching your criteria.');
    });

    it('should sort by spend field correctly', async () => {
      const result = await service.queryCampaigns('top campaigns by spend');

      // Camp-1 has highest spend (1000)
      expect(result.campaigns[0].stats.spend).toBe(1000);
    });

    it('should handle sorting by CPC', async () => {
      const result = await service.queryCampaigns('worst campaigns by CPC');

      // Ascending order, camp-3 has highest CPC (0.5)
      expect(result.campaigns[0].kpis.cpc).toBe(0.2);
    });

    it('should include intent in response', async () => {
      const result = await service.queryCampaigns('top 5 active campaigns by CTR');

      expect(result.intent.status).toBe(CampaignStatus.ACTIVE);
      expect(result.intent.sortBy).toBe('ctr');
      expect(result.intent.limit).toBe(5);
    });

    it('should use default limit of 10 when not specified', async () => {
      await service.queryCampaigns('active campaigns');

      expect(campaignsService.getCampaigns).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 }),
      );
    });

  });
});

