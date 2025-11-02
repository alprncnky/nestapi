import { Param, ParseIntPipe } from '@nestjs/common';
import { CrudController } from '../../../common/decorators/crud-controller.decorator';
import { FetchEndpoint, GetLatestByEndpoint } from '../../../common/decorators/endpoint.decorator';
import { StockResponseDto } from '../contracts/responses/stock-response.dto';
import { FetchBist100ResponseDto } from '../contracts/responses/fetch-bist100-response.dto';
import { MarketTypeEnum } from '../contracts/enums/market-type.enum';
import { StocksService } from '../business/services/stocks.service';

@CrudController('stocks', 'Stock')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @FetchEndpoint('bist100', FetchBist100ResponseDto)
  async fetchBist100(): Promise<FetchBist100ResponseDto> {
    const result = await this.stocksService.fetchAndSaveBist100();
    return new FetchBist100ResponseDto({
      message: 'BIST 100 fetch completed',
      saved: result.saved,
      errors: result.errors,
    });
  }

  @GetLatestByEndpoint('marketType', StockResponseDto, MarketTypeEnum)
  async getLatestByMarketType(@Param('marketType', ParseIntPipe) marketType: number): Promise<StockResponseDto[]> {
    const stocks = await this.stocksService.getLatestByMarketType(marketType);
    return stocks.map((stock) => new StockResponseDto(stock));
  }
}

