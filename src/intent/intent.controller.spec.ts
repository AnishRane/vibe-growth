import { Test, TestingModule } from '@nestjs/testing';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';
import { IntentQueryDto } from './dto/intent-query.dto';
import { BadRequestException } from '@nestjs/common';

describe('IntentController', () => {
  let controller: IntentController;
  let service: IntentService;

  const mockIntentResponse = {
    intent: {
      status: 'active',
      sortBy: 'ctr',
      sortOrder: 'desc',
      limit: 5,
    },
    campaigns: [
      {
        id: 'camp-1',
        name: 'Campaign 1',
        status: 'active',
        kpis: { ctr: 8.0, cvr: 5.0, cpc: 0.2, cpa: 4.0 },
      },
    ],
    message: 'Found 1 campaign with status "active" sorted by highest CTR.',
  };

  const mockIntentService = {
    queryCampaigns: jest.fn().mockResolvedValue(mockIntentResponse),
    parsePrompt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntentController],
      providers: [
        {
          provide: IntentService,
          useValue: mockIntentService,
        },
      ],
    }).compile();

    controller = module.get<IntentController>(IntentController);
    service = module.get<IntentService>(IntentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('query', () => {
    it('should return intent query results', async () => {
      const dto: IntentQueryDto = { prompt: 'Show me top 5 active campaigns by CTR' };
      
      const result = await controller.query(dto);

      expect(result).toEqual(mockIntentResponse);
      expect(service.queryCampaigns).toHaveBeenCalledWith(dto.prompt);
      expect(service.queryCampaigns).toHaveBeenCalledTimes(1);
    });

    it('should pass prompt to service', async () => {
      const dto: IntentQueryDto = { prompt: 'Show me paused campaigns from last week' };
      
      await controller.query(dto);

      expect(service.queryCampaigns).toHaveBeenCalledWith('Show me paused campaigns from last week');
    });

    it('should return correct response structure', async () => {
      const dto: IntentQueryDto = { prompt: 'Top campaigns' };
      
      const result = await controller.query(dto);

      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('campaigns');
      expect(result).toHaveProperty('message');
    });

    it('should handle prompts with status filter', async () => {
      const dto: IntentQueryDto = { prompt: 'Show me active campaigns' };
      
      const response = {
        intent: { status: 'active' },
        campaigns: [],
        message: 'Found 0 campaigns with status "active".',
      };
      mockIntentService.queryCampaigns.mockResolvedValueOnce(response);

      const result = await controller.query(dto);

      expect(result.intent.status).toBe('active');
      expect(service.queryCampaigns).toHaveBeenCalledWith(dto.prompt);
    });

    it('should handle prompts with date filters', async () => {
      const dto: IntentQueryDto = { prompt: 'Campaigns from last 7 days' };
      
      const response = {
        intent: { 
          dateFrom: '2025-10-08',
          dateTo: '2025-10-15',
        },
        campaigns: [],
        message: 'Found 0 campaigns from 2025-10-08 to 2025-10-15.',
      };
      mockIntentService.queryCampaigns.mockResolvedValueOnce(response);

      const result = await controller.query(dto);

      expect(result.intent).toHaveProperty('dateFrom');
      expect(result.intent).toHaveProperty('dateTo');
    });

    it('should handle prompts with sorting', async () => {
      const dto: IntentQueryDto = { prompt: 'Best campaigns by conversion rate' };
      
      const response = {
        intent: { 
          sortBy: 'cvr',
          sortOrder: 'desc',
        },
        campaigns: [],
        message: 'Found 0 campaigns sorted by highest CVR.',
      };
      mockIntentService.queryCampaigns.mockResolvedValueOnce(response);

      const result = await controller.query(dto);

      expect(result.intent.sortBy).toBe('cvr');
      expect(result.intent.sortOrder).toBe('desc');
    });

    it('should handle prompts with limit', async () => {
      const dto: IntentQueryDto = { prompt: 'Top 10 campaigns' };
      
      const response = {
        intent: { 
          limit: 10,
          sortOrder: 'desc',
        },
        campaigns: [],
        message: 'Found 0 campaigns.',
      };
      mockIntentService.queryCampaigns.mockResolvedValueOnce(response);

      const result = await controller.query(dto);

      expect(result.intent.limit).toBe(10);
    });

    it('should handle invalid prompts', async () => {
      const dto: IntentQueryDto = { prompt: 'gibberish text' };
      
      mockIntentService.queryCampaigns.mockRejectedValueOnce(
        new BadRequestException({
          message: 'Unable to parse your prompt. Try these examples:',
          hints: ['Show me active campaigns'],
        }),
      );

      await expect(controller.query(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle empty prompt', async () => {
      const dto: IntentQueryDto = { prompt: '   ' };
      
      mockIntentService.queryCampaigns.mockRejectedValueOnce(
        new BadRequestException('Unable to parse your prompt.'),
      );

      await expect(controller.query(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle complex multi-filter prompts', async () => {
      const dto: IntentQueryDto = { 
        prompt: 'Show me top 5 active campaigns from last month sorted by CTR' 
      };
      
      const response = {
        intent: { 
          status: 'active',
          dateFrom: '2025-09-01',
          dateTo: '2025-09-30',
          sortBy: 'ctr',
          sortOrder: 'desc',
          limit: 5,
        },
        campaigns: [],
        message: 'Found 0 campaigns with status "active" from 2025-09-01 to 2025-09-30 sorted by highest CTR.',
      };
      mockIntentService.queryCampaigns.mockResolvedValueOnce(response);

      const result = await controller.query(dto);

      expect(result.intent.status).toBe('active');
      expect(result.intent.sortBy).toBe('ctr');
      expect(result.intent.limit).toBe(5);
    });

    it('should return campaigns array', async () => {
      const dto: IntentQueryDto = { prompt: 'Show campaigns' };
      
      const result = await controller.query(dto);

      expect(Array.isArray(result.campaigns)).toBe(true);
    });

    it('should return descriptive message', async () => {
      const dto: IntentQueryDto = { prompt: 'Top campaigns' };
      
      const result = await controller.query(dto);

      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    });
  });
});

