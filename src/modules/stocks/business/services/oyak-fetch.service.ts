import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { Stock } from '../../data/entities/stock.entity';
import { MarketTypeEnum } from '../../contracts/enums/market-type.enum';

export interface OyakStockData {
  symbol: string;
  name: string;
  last: number;
  high: number;
  low: number;
  volume: number;
  dailyPercent: number;
  weeklyPercent: number;
  monthlyPercent: number;
  yearlyPercent: number;
}

@Injectable()
export class OyakFetchService {
  private readonly logger = new Logger(OyakFetchService.name);
  private readonly BASE_URL = 'https://www.oyakyatirim.com.tr/piyasa-verileri/XU100';

  async fetchBist100Prices(): Promise<OyakStockData[]> {
    try {
      const response = await fetch(this.BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const stocks = this.parseHtml(html);
      return stocks;
    } catch (error) {
      this.logger.error(`Failed to fetch BIST 100 prices: ${error.message}`, error.stack);
      throw error;
    }
  }

  private parseHtml(html: string): OyakStockData[] {
    const $ = cheerio.load(html);
    const stocks: OyakStockData[] = [];
    $('table tbody tr').each((_, element) => {
      try {
        const $row = $(element);
        const cells = $row.find('td');
        if (cells.length < 10) return;
        const symbol = $(cells[0]).text().trim();
        const name = $(cells[1]).text().trim();
        const last = $(cells[2]).text().trim();
        const high = $(cells[3]).text().trim();
        const low = $(cells[4]).text().trim();
        const volume = $(cells[5]).text().trim();
        const daily = $(cells[6]).text().trim();
        const weekly = $(cells[7]).text().trim();
        const monthly = $(cells[8]).text().trim();
        const yearly = $(cells[9]).text().trim();
        if (!/^[A-Z]{3,6}$/.test(symbol)) return;
        stocks.push({symbol, name, last: this.parseNumber(last), high: this.parseNumber(high), low: this.parseNumber(low), volume: this.parseNumber(volume), dailyPercent: this.parseNumber(daily), weeklyPercent: this.parseNumber(weekly), monthlyPercent: this.parseNumber(monthly), yearlyPercent: this.parseNumber(yearly)});
      } catch (error) {
        this.logger.warn(`Failed to parse row: ${error.message}`);
      }
    });
    return stocks;
  }

  private parseNumber(value: string): number {
    if (!value || value === '-' || value === 'N/A') return 0;
    try {
      const removeDots = value.replace(/\./g, '');
      const replaceComa = removeDots.replace(',', '.');
      const cleaned = replaceComa.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      this.logger.warn(`Failed to parse number: "${value}"`);
      return 0;
    }
  }

  convertToStockEntity(data: OyakStockData): Stock {
    const stock = new Stock();
    stock.symbol = data.symbol;
    stock.name = data.name;
    stock.lastPrice = data.last;
    stock.highestPrice = data.high;
    stock.lowestPrice = data.low;
    stock.volume = data.volume;
    stock.marketType = MarketTypeEnum.BIST100;
    stock.dailyPercent = data.dailyPercent;
    stock.weeklyPercent = data.weeklyPercent;
    stock.monthlyPercent = data.monthlyPercent;
    stock.yearlyPercent = data.yearlyPercent;
    stock.fetchedAt = new Date();
    stock.createdAt = new Date();
    stock.updatedAt = new Date();
    return stock;
  }

  async testFetch(): Promise<void> {
    const stocks = await this.fetchBist100Prices();
    if (stocks.length > 0) {
      this.logger.log(`✅ Test successful: Fetched ${stocks.length} stocks`);
      this.logger.log('Sample:', JSON.stringify(stocks[0], null, 2));
    }
  }
}

