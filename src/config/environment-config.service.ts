import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfigService {
  constructor(private readonly configService: ConfigService) {}
  getXApiKey() {
    return this.configService.get<string>('X_API_KEY');
  }
}