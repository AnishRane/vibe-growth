import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addMetric', () => {
    it('should add a metric', () => {
      service.addMetric(100, false);
      const metrics = service.getHealthMetrics();
      expect(metrics.latencyP95).toBeGreaterThan(0);
    });

    it('should keep only last 100 metrics', () => {
      // Add 150 metrics
      for (let i = 0; i < 150; i++) {
        service.addMetric(i, false);
      }

      // Should only have 100 metrics, so P95 should be based on metrics 50-149
      const p95 = service.getLatencyP95();
      expect(p95).toBeGreaterThanOrEqual(50);
    });
  });

  describe('getUptime', () => {
    it('should return uptime in seconds format', () => {
      const uptime = service.getUptime();
      expect(uptime).toMatch(/^\d+s$/);
    });

    it('should return uptime in minutes format', () => {
      // Create a new service instance with mocked start time
      const testService = new HealthService();
      // @ts-expect-error - Accessing private property for testing
      testService.startTime = Date.now() - 120000; // 2 minutes ago

      const uptime = testService.getUptime();
      expect(uptime).toMatch(/^\d+m \d+s$/);
    });

    it('should return uptime in hours format', () => {
      const testService = new HealthService();
      // @ts-expect-error - Accessing private property for testing
      testService.startTime = Date.now() - 7200000; // 2 hours ago

      const uptime = testService.getUptime();
      expect(uptime).toMatch(/^\d+h \d+m$/);
    });
  });

  describe('getLatencyP95', () => {
    it('should return 0 when no metrics', () => {
      const p95 = service.getLatencyP95();
      expect(p95).toBe(0);
    });

    it('should calculate P95 correctly', () => {
      // Add metrics: 1, 2, 3, ..., 100
      for (let i = 1; i <= 100; i++) {
        service.addMetric(i, false);
      }

      const p95 = service.getLatencyP95();
      // P95 of 1-100 should be 95
      expect(p95).toBe(95);
    });

    it('should calculate P95 correctly with fewer metrics', () => {
      // Add 20 metrics
      for (let i = 1; i <= 20; i++) {
        service.addMetric(i * 10, false);
      }

      const p95 = service.getLatencyP95();
      // P95 of [10, 20, ..., 200] = 190
      expect(p95).toBe(190);
    });
  });

  describe('getErrorRate', () => {
    it('should return 0 when no metrics', () => {
      const errorRate = service.getErrorRate();
      expect(errorRate).toBe(0);
    });

    it('should calculate error rate correctly', () => {
      // Add 100 metrics, 25 of which are errors
      for (let i = 0; i < 100; i++) {
        service.addMetric(100, i < 25);
      }

      const errorRate = service.getErrorRate();
      expect(errorRate).toBe(25);
    });

    it('should round error rate to 2 decimal places', () => {
      // Add 3 metrics, 1 error = 33.33%
      service.addMetric(100, true);
      service.addMetric(100, false);
      service.addMetric(100, false);

      const errorRate = service.getErrorRate();
      expect(errorRate).toBe(33.33);
    });
  });

  describe('getHealthMetrics', () => {
    it('should return all health metrics', () => {
      service.addMetric(100, false);
      service.addMetric(200, true);
      service.addMetric(150, false);

      const metrics = service.getHealthMetrics();

      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('latencyP95');
      expect(metrics).toHaveProperty('errorRate');
      expect(typeof metrics.uptime).toBe('string');
      expect(typeof metrics.latencyP95).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
    });
  });
});
