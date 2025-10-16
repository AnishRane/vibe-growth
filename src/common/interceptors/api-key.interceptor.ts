import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { EnvironmentConfigService } from 'src/config/environment-config.service';

@Injectable()
export class ApiKeyInterceptor implements NestInterceptor {
  private readonly apiKey: string;
  private readonly excludedPaths: string[];

  constructor(
    private readonly environmentConfigService:EnvironmentConfigService
  ) {
    this.apiKey = this.environmentConfigService.getXApiKey() ||'';
    this.excludedPaths = ['/health', '/api'];
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();


    if (this.shouldSkipVerification(request.path)) {
      return next.handle();
    }


    if (!this.apiKey) {
      console.warn('API_KEY not configured - skipping API key verification');
      return next.handle();
    }

    const requestApiKey = this.extractApiKey(request);

    if (!requestApiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    if (requestApiKey !== this.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return next.handle();
  }

  private extractApiKey(request: Request): string | undefined {
    return request.headers['x-api-key'] as string;
  }

  private shouldSkipVerification(path: string): boolean {
    return this.excludedPaths.some(excludedPath => 
      path.startsWith(excludedPath)
    );
  }
}

