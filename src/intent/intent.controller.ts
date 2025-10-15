import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IntentService } from './intent.service';
import { IntentQueryDto, IntentResponseDto } from './dto/intent-query.dto';

@ApiTags('intent')
@Controller('intent')
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post('query')
  @ApiOperation({ 
    summary: 'Query campaigns using natural language',
    description: 'Process a natural language query to search and filter campaigns. The system will parse your intent and extract filters like status, date range, sorting preferences, and limits. Examples: "Show me active campaigns from last month", "Find top 5 campaigns by CTR", "Completed campaigns in September 2025"'
  })
  @ApiBody({ 
    type: IntentQueryDto,
    examples: {
      example1: {
        summary: 'Filter by status',
        value: { prompt: 'Show me all active campaigns' }
      },
      example2: {
        summary: 'Date range and sorting',
        value: { prompt: 'Find campaigns from last month sorted by CTR' }
      },
      example3: {
        summary: 'Complex query',
        value: { prompt: 'Show me top 5 active campaigns from September 2025 with highest conversion rate' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully processed query and returned matching campaigns',
    type: IntentResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request body' 
  })
  async query(@Body() intentQueryDto: IntentQueryDto): Promise<IntentResponseDto> {
    return this.intentService.queryCampaigns(intentQueryDto.prompt);
  }
}

