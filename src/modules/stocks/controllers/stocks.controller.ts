import { CrudResource } from '../../../common/decorators/crud-resource.decorator';
import { FetchEndpoint } from '../../../common/decorators/endpoint.decorator';
import { Stock } from '../data/entities/stock.entity';
import { SaveStockDto } from '../contracts/requests/save-stock.dto';
import { StockResponseDto } from '../contracts/responses/stock-response.dto';
import { StockListResponseDto } from '../contracts/responses/stock-list-response.dto';
import { FetchBist100ResponseDto } from '../contracts/responses/fetch-bist100-response.dto';
import { StocksService } from '../business/services/stocks.service';

@CrudResource({path: 'stocks', entityName: 'Stock', entity: Stock, requestDto: SaveStockDto, responseDto: StockResponseDto, listResponseDto: StockListResponseDto})
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
}

