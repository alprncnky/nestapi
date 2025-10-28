import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StockPricesService } from '../business/services/stock-prices.service';
import { StockPriceResponseDto } from '../contracts/responses/stock-price-response.dto';
import { StockPriceListResponseDto } from '../contracts/responses/stock-price-list-response.dto';

@ApiTags('stock-prices')
@Controller('stock-prices')
export class StockPricesController {
  constructor(private readonly stockPricesService: StockPricesService) {}

  @Get('get')
  async get(@Query('id', ParseIntPipe) id: number): Promise<StockPriceResponseDto> {
    const stock = await this.stockPricesService.findById(id);
    return new StockPriceResponseDto(stock);
  }

  @Get('getall')
  async getLatest(): Promise<StockPriceListResponseDto> {
    const stocks = await this.stockPricesService.findAllLatest();
    return new StockPriceListResponseDto(
      stocks.map(s => new StockPriceResponseDto(s)),
      stocks.length
    );
  }

  @Get('symbol')
  async getBySymbol(@Query('symbol') symbol: string): Promise<StockPriceResponseDto> {
    const stock = await this.stockPricesService.findLatestBySymbol(symbol);
    if (!stock) {
      throw new Error(`Stock with symbol ${symbol} not found`);
    }
    return new StockPriceResponseDto(stock);
  }
}
