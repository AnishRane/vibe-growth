import { Injectable, BadRequestException } from '@nestjs/common';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CampaignStatus } from '../campaigns/dto/get-campaigns.dto';
import { ParsedIntent, SortByField, SortOrder } from './dto/intent-query.dto';

@Injectable()
export class IntentService {
  constructor(private readonly campaignsService: CampaignsService) {}

  parsePrompt(prompt: string): ParsedIntent {
    const lowerPrompt = prompt.toLowerCase().trim();
    const intent: ParsedIntent = {};


    intent.status = this.parseStatus(lowerPrompt);


    const dateFilters = this.parseDateFilters(lowerPrompt);
    if (dateFilters.dateFrom) intent.dateFrom = dateFilters.dateFrom;
    if (dateFilters.dateTo) intent.dateTo = dateFilters.dateTo;


    const sorting = this.parseSorting(lowerPrompt);
    if (sorting.sortBy) intent.sortBy = sorting.sortBy;
    if (sorting.sortOrder) intent.sortOrder = sorting.sortOrder;


    const limit = this.parseLimit(lowerPrompt);
    if (limit) intent.limit = limit;

    return intent;
  }

  private parseStatus(prompt: string): CampaignStatus | undefined {
    if (prompt.includes('active')) return CampaignStatus.ACTIVE;
    if (prompt.includes('paused')) return CampaignStatus.PAUSED;
    if (prompt.includes('completed')) return CampaignStatus.COMPLETED;
    return undefined;
  }

  private parseDateFilters(prompt: string): { dateFrom?: string; dateTo?: string } {
    const today = new Date();
    const result: { dateFrom?: string; dateTo?: string } = {};

    // Yesterday
    if (prompt.includes('yesterday')) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      result.dateFrom = yesterday.toISOString().split('T')[0];
      result.dateTo = yesterday.toISOString().split('T')[0];
      return result;
    }

    // Today
    if (prompt.includes('today')) {
      result.dateFrom = today.toISOString().split('T')[0];
      result.dateTo = today.toISOString().split('T')[0];
      return result;
    }

    // Last N days
    const lastDaysMatch = prompt.match(/last (\d+) days?/);
    if (lastDaysMatch) {
      const days = parseInt(lastDaysMatch[1], 10);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);
      result.dateFrom = startDate.toISOString().split('T')[0];
      result.dateTo = today.toISOString().split('T')[0];
      return result;
    }

    // This week
    if (prompt.includes('this week')) {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      startOfWeek.setDate(diff);
      result.dateFrom = startOfWeek.toISOString().split('T')[0];
      result.dateTo = today.toISOString().split('T')[0];
      return result;
    }

    // Last week
    if (prompt.includes('last week')) {
      const startOfLastWeek = new Date(today);
      const day = startOfLastWeek.getDay();
      const diff = startOfLastWeek.getDate() - day + (day === 0 ? -6 : 1) - 7;
      startOfLastWeek.setDate(diff);
      
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
      
      result.dateFrom = startOfLastWeek.toISOString().split('T')[0];
      result.dateTo = endOfLastWeek.toISOString().split('T')[0];
      return result;
    }

    // This month
    if (prompt.includes('this month')) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      result.dateFrom = startOfMonth.toISOString().split('T')[0];
      result.dateTo = today.toISOString().split('T')[0];
      return result;
    }

    // Last month
    if (prompt.includes('last month')) {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      result.dateFrom = startOfLastMonth.toISOString().split('T')[0];
      result.dateTo = endOfLastMonth.toISOString().split('T')[0];
      return result;
    }

    // This year
    if (prompt.includes('this year')) {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      result.dateFrom = startOfYear.toISOString().split('T')[0];
      result.dateTo = today.toISOString().split('T')[0];
      return result;
    }

    return result;
  }

  private parseSorting(prompt: string): { sortBy?: SortByField; sortOrder?: SortOrder } {
    const result: { sortBy?: SortByField; sortOrder?: SortOrder } = {};

    // Determine sort order (default to desc for "top"/"best", asc for "worst"/"lowest")
    if (prompt.includes('worst') || prompt.includes('lowest') || prompt.includes('bottom')) {
      result.sortOrder = 'asc';
    } else if (prompt.includes('top') || prompt.includes('best') || prompt.includes('highest')) {
      result.sortOrder = 'desc';
    }

    // Determine sort field
    if (prompt.includes('ctr') || prompt.includes('click-through') || prompt.includes('click through')) {
      result.sortBy = 'ctr';
    } else if (prompt.includes('cvr') || prompt.includes('conversion rate')) {
      result.sortBy = 'cvr';
    } else if (prompt.includes('cpc') || prompt.includes('cost per click')) {
      result.sortBy = 'cpc';
    } else if (prompt.includes('cpa') || prompt.includes('cost per acquisition') || prompt.includes('cost per conversion')) {
      result.sortBy = 'cpa';
    } else if (prompt.includes('spend') || prompt.includes('cost')) {
      result.sortBy = 'spend';
    }

    return result;
  }

  private parseLimit(prompt: string): number | undefined {
    // Top N
    const topMatch = prompt.match(/top (\d+)/);
    if (topMatch) {
      return parseInt(topMatch[1], 10);
    }

    // Worst/bottom N
    const worstMatch = prompt.match(/(?:worst|bottom|lowest) (\d+)/);
    if (worstMatch) {
      return parseInt(worstMatch[1], 10);
    }

    return undefined;
  }

  async queryCampaigns(prompt: string) {
    const intent = this.parsePrompt(prompt);

    // Check if we parsed anything useful
    const hasValidIntent = 
      intent.status !== undefined ||
      intent.dateFrom !== undefined ||
      intent.dateTo !== undefined ||
      intent.sortBy !== undefined;

    if (!hasValidIntent) {
      throw new BadRequestException({
        message: 'Unable to parse your prompt. Try these examples:',
        hints: [
          '"Show me active campaigns"',
          '"Top 5 campaigns by CTR"',
          '"Paused campaigns from last week"',
          '"Best performing campaigns by conversion rate"',
          '"Campaigns from last 30 days"',
          '"Show me yesterday\'s campaigns"',
          '"Worst campaigns by CPA"',
        ],
      });
    }

    // Query campaigns using parsed filters
    const result = await this.campaignsService.getCampaigns({
      status: intent.status,
      dateFrom: intent.dateFrom,
      dateTo: intent.dateTo,
      page: 1,
      limit: intent.limit || 10,
    });

    let campaigns = result.data;

    // Apply sorting if specified
    if (intent.sortBy) {
      campaigns = this.sortCampaigns(campaigns, intent.sortBy, intent.sortOrder || 'desc');
      
      // Apply limit after sorting if specified
      if (intent.limit) {
        campaigns = campaigns.slice(0, intent.limit);
      }
    }

    return {
      intent,
      campaigns,
      message: this.generateMessage(intent, campaigns.length),
    };
  }

  private sortCampaigns(campaigns: any[], sortBy: SortByField, sortOrder: SortOrder): any[] {
    const sorted = [...campaigns].sort((a, b) => {
      let valueA: number;
      let valueB: number;

      if (sortBy === 'spend') {
        valueA = a.stats.spend;
        valueB = b.stats.spend;
      } else {
        valueA = a.kpis[sortBy];
        valueB = b.kpis[sortBy];
      }

      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return sorted;
  }

  private generateMessage(intent: ParsedIntent, count: number): string {
    const parts: string[] = [];

    if (count === 0) {
      return 'No campaigns found matching your criteria.';
    }

    parts.push(`Found ${count} campaign${count !== 1 ? 's' : ''}`);

    if (intent.status) {
      parts.push(`with status "${intent.status}"`);
    }

    if (intent.dateFrom || intent.dateTo) {
      if (intent.dateFrom && intent.dateTo) {
        parts.push(`from ${intent.dateFrom} to ${intent.dateTo}`);
      } else if (intent.dateFrom) {
        parts.push(`from ${intent.dateFrom}`);
      } else if (intent.dateTo) {
        parts.push(`until ${intent.dateTo}`);
      }
    }

    if (intent.sortBy) {
      const orderText = intent.sortOrder === 'asc' ? 'lowest' : 'highest';
      parts.push(`sorted by ${orderText} ${intent.sortBy.toUpperCase()}`);
    }

    return parts.join(' ') + '.';
  }
}

