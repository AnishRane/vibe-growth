import { Controller, Post, Body } from '@nestjs/common';
import { IntentService } from './intent.service';
import { IntentQueryDto } from './dto/intent-query.dto';

@Controller('intent')
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post('query')
  async query(@Body() intentQueryDto: IntentQueryDto) {
    return this.intentService.queryCampaigns(intentQueryDto.prompt);
  }
}

