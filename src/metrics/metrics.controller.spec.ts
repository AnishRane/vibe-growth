import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let service: MetricsService;

  const mockMetricsSummary = {
    totals: {
      impressions: 1000000,
      clicks: 50000,
      conversions: 2500,
      spend: 10000,
    },
    averages: {
      ctr: 5.0,
      cvr: 5.0,
      cpc: 0.2,
      cpa: 4.0,
    },
    bestPerforming: {
      byCTR: {
        id: 'camp-1',
        name: 'Campaign 1',
        value: 7.5,
      },
      byCVR: {
        id: 'camp-2',
        name: 'Campaign 2',
        value: 8.0,
      },
    },
    worstPerforming: {
      byCTR: {
        id: 'camp-3',
        name: 'Campaign 3',
        value: 2.5,
      },
      byCVR: {
        id: 'camp-4',
        name: 'Campaign 4',
        value: 3.0,
      },
    },
  };

  const mockMetricsService = {
    getSummary: jest.fn().mockReturnValue(mockMetricsSummary),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return metrics summary', () => {
      const result = controller.getSummary();

      expect(result).toEqual(mockMetricsSummary);
      expect(service.getSummary).toHaveBeenCalledTimes(1);
    });

    it('should return correct data structure', () => {
      const result = controller.getSummary();

      expect(result).toHaveProperty('totals');
      expect(result).toHaveProperty('averages');
      expect(result).toHaveProperty('bestPerforming');
      expect(result).toHaveProperty('worstPerforming');
    });

    it('should return totals with correct properties', () => {
      const result = controller.getSummary();

      expect(result.totals).toHaveProperty('impressions');
      expect(result.totals).toHaveProperty('clicks');
      expect(result.totals).toHaveProperty('conversions');
      expect(result.totals).toHaveProperty('spend');
      expect(typeof result.totals.impressions).toBe('number');
      expect(typeof result.totals.clicks).toBe('number');
      expect(typeof result.totals.conversions).toBe('number');
      expect(typeof result.totals.spend).toBe('number');
    });

    it('should return averages with correct KPI properties', () => {
      const result = controller.getSummary();

      expect(result.averages).toHaveProperty('ctr');
      expect(result.averages).toHaveProperty('cvr');
      expect(result.averages).toHaveProperty('cpc');
      expect(result.averages).toHaveProperty('cpa');
      expect(typeof result.averages.ctr).toBe('number');
      expect(typeof result.averages.cvr).toBe('number');
      expect(typeof result.averages.cpc).toBe('number');
      expect(typeof result.averages.cpa).toBe('number');
    });

    it('should return best performing campaigns structure', () => {
      const result = controller.getSummary();

      expect(result.bestPerforming).toHaveProperty('byCTR');
      expect(result.bestPerforming).toHaveProperty('byCVR');
      
      if (result.bestPerforming.byCTR) {
        expect(result.bestPerforming.byCTR).toHaveProperty('id');
        expect(result.bestPerforming.byCTR).toHaveProperty('name');
        expect(result.bestPerforming.byCTR).toHaveProperty('value');
      }
    });

    it('should return worst performing campaigns structure', () => {
      const result = controller.getSummary();

      expect(result.worstPerforming).toHaveProperty('byCTR');
      expect(result.worstPerforming).toHaveProperty('byCVR');
      
      if (result.worstPerforming.byCTR) {
        expect(result.worstPerforming.byCTR).toHaveProperty('id');
        expect(result.worstPerforming.byCTR).toHaveProperty('name');
        expect(result.worstPerforming.byCTR).toHaveProperty('value');
      }
    });
  });
});

