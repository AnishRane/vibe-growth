import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { HealthService } from './health.service';
import { Request, Response } from 'express';

@Injectable()
export class MetricsTrackerInterceptor implements NestInterceptor {
  constructor(private readonly healthService: HealthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    // Skip tracking for health endpoints
    if (request.path.startsWith('/health')) {
      return next.handle();
    }

    const startTime = Date.now();
    let hasError = false;

    return next.handle().pipe(
      tap(() => {
        // Success path - will be tracked in finalize
      }),
      catchError((error: Error | HttpException) => {
        hasError = true;
        return throwError(() => error);
      }),
      finalize(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || 200;
        const isError = hasError || statusCode >= 400;
        this.healthService.addMetric(duration, isError);
      }),
    );
  }
}
