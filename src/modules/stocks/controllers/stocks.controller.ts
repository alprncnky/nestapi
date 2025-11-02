import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StockResponseDto } from '../contracts/responses/stock-response.dto';
import { StocksService } from '../business/services/stocks.service';

@Controller('stocks')
@ApiTags('Stock')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('fetch/bist100')
  async fetchBist100(): Promise<{ message: string; saved: number; errors: number }> {
    const result = await this.stocksService.fetchAndSaveBist100();
    return {
      message: 'BIST 100 fetch completed',
      saved: result.saved,
      errors: result.errors,
    };
  }

  @Get('latest/:marketType')
  async getLatestByMarketType(@Param('marketType', ParseIntPipe) marketType: number): Promise<StockResponseDto[]> {
    const stocks = await this.stocksService.getLatestByMarketType(marketType);
    return stocks.map((stock) => new StockResponseDto(stock));
  }
}

