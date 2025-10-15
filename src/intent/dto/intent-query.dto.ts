import { IsString, IsNotEmpty } from 'class-validator';
import { CampaignStatus } from '../../campaigns/dto/get-campaigns.dto';

export class IntentQueryDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

export type SortByField = 'ctr' | 'cvr' | 'cpc' | 'cpa' | 'spend';
export type SortOrder = 'asc' | 'desc';

export interface ParsedIntent {
  status?: CampaignStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: SortByField;
  sortOrder?: SortOrder;
  limit?: number;
}

export class IntentResponseDto {
  intent: ParsedIntent;
  campaigns: any[];
  message?: string;
}

