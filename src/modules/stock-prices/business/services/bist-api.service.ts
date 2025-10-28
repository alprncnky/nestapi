import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BistApiStockData {
  code: string;
  open: number;
  close: number;
  high: number;
  low: number;
  last: number;
  daily_change_price: number;
  daily_change_percent: number;
  volume_turkish_lira: number;
  volume_lot: number;
  volatility: number;
  last_update: string;
}

export interface BistApiResponse {
  success: boolean;
  message: string;
  data: BistApiStockData[];
}

@Injectable()
export class BistApiService {
  private readonly logger = new Logger(BistApiService.name);
  private readonly apiUrl: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly apiHost: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('BIST_API_URL');
    this.apiKey = this.configService.get<string>('BIST_API_KEY');
    this.apiHost = this.configService.get<string>('BIST_API_HOST');

    if (!this.apiUrl || !this.apiKey || !this.apiHost) {
      this.logger.warn('BIST API credentials not configured. Stock fetching will be disabled.');
    }
  }

  async fetchBist100Prices(): Promise<BistApiStockData[]> {
    if (!this.apiUrl || !this.apiKey || !this.apiHost) {
      throw new Error('BIST API credentials not configured');
    }

    try {
      this.logger.log('Fetching BIST100 stock prices from API...');

      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`BIST API returned status ${response.status}`);
      }

      const result: BistApiResponse = await response.json();

      if (!result.success) {
        throw new Error(`BIST API error: ${result.message}`);
      }

      this.logger.log(`Successfully fetched ${result.data.length} stock prices`);
      return result.data;
    } catch (error) {
      this.logger.error(`Failed to fetch BIST100 prices: ${error.message}`, error.stack);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!(this.apiUrl && this.apiKey && this.apiHost);
  }
}
