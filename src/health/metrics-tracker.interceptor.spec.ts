import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { of, throwError, Observable } from 'rxjs';
import { MetricsTrackerInterceptor } from './metrics-tracker.interceptor';
import { HealthService } from './health.service';

describe('MetricsTrackerInterceptor', () => {
  let interceptor: MetricsTrackerInterceptor;
  let healthService: HealthService;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsTrackerInterceptor, HealthService],
    }).compile();

    interceptor = module.get<MetricsTrackerInterceptor>(
      MetricsTrackerInterceptor,
    );
    healthService = module.get<HealthService>(HealthService);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => ({
          statusCode: 200,
        }),
      }),
    } as ExecutionContext;

    // Mock CallHandler
    mockCallHandler = {
      handle: () => of('test'),
    } as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should track successful request metrics', (done) => {
      const addMetricSpy = jest.spyOn(healthService, 'addMetric');

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (data) => {
          expect(data).toBe('test');
        },
        complete: () => {
          // finalize runs after complete, so we need to wait
          setImmediate(() => {
            expect(addMetricSpy).toHaveBeenCalledWith(
              expect.any(Number),
              false,
            );
            done();
          });
        },
      });
    });

    it('should track error metrics for 4xx errors', (done) => {
      const addMetricSpy = jest.spyOn(healthService, 'addMetric');
      const error = new HttpException('Not Found', 404);

      mockCallHandler.handle = () => throwError(() => error);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          // finalize runs after error, so we need to wait
          setImmediate(() => {
            expect(addMetricSpy).toHaveBeenCalledWith(expect.any(Number), true);
            done();
          });
        },
      });
    });

    it('should track error metrics for 5xx errors', (done) => {
      const addMetricSpy = jest.spyOn(healthService, 'addMetric');
      const error = new HttpException('Internal Server Error', 500);

      mockCallHandler.handle = () => throwError(() => error);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          // finalize runs after error, so we need to wait
          setImmediate(() => {
            expect(addMetricSpy).toHaveBeenCalledWith(expect.any(Number), true);
            done();
          });
        },
      });
    });

    it('should track metrics for non-HTTP errors with 500 status', (done) => {
      const addMetricSpy = jest.spyOn(healthService, 'addMetric');
      const error = new Error('Generic Error');

      // Mock response to return 500 for generic errors
      mockExecutionContext = {
        switchToHttp: () => ({
          getResponse: () => ({
            statusCode: 500,
          }),
        }),
      } as ExecutionContext;

      mockCallHandler.handle = () => throwError(() => error);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          // finalize runs after error, so we need to wait
          setImmediate(() => {
            expect(addMetricSpy).toHaveBeenCalledWith(expect.any(Number), true);
            done();
          });
        },
      });
    });

    it('should measure request duration', (done) => {
      const addMetricSpy = jest.spyOn(healthService, 'addMetric');
      const startTime = Date.now();

      // Create a delayed observable
      mockCallHandler.handle = () => {
        return new Observable((observer) => {
          setTimeout(() => {
            observer.next('test');
            observer.complete();
          }, 10);
        });
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          // finalize runs after complete, so we need to wait
          setImmediate(() => {
            const duration = Date.now() - startTime;
            expect(addMetricSpy).toHaveBeenCalled();
            const capturedDuration = addMetricSpy.mock.calls[0][0];
            expect(capturedDuration).toBeGreaterThanOrEqual(10);
            expect(capturedDuration).toBeLessThan(duration + 50);
            done();
          });
        },
      });
    });
  });
});
