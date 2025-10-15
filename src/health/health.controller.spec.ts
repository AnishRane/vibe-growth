import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health metrics', () => {
      const mockMetrics = {
        uptime: '2h 31m',
        latencyP95: 92,
        errorRate: 1.25,
      };

      const getHealthMetricsSpy = jest
        .spyOn(service, 'getHealthMetrics')
        .mockReturnValue(mockMetrics);

      const result = controller.getHealth();

      expect(result).toEqual(mockMetrics);
      expect(getHealthMetricsSpy).toHaveBeenCalled();
    });

    it('should return current health status', () => {
      service.addMetric(100, false);
      service.addMetric(200, false);

      const result = controller.getHealth();

      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('latencyP95');
      expect(result).toHaveProperty('errorRate');
    });
  });
});
