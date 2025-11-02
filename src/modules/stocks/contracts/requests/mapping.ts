import {
  StringField,
  NumberField,
  EnumField,
} from '../../../../common/decorators/field.decorator';
import { MarketTypeEnum } from '../enums/market-type.enum';

export const SaveStockMapping = {
  id: () => NumberField('Stock ID (optional, for updates)', 1, false),
  symbol: () => StringField('Stock symbol', 'AKBNK', true, 2, 10),
  name: () => StringField('Stock name', 'AKBANK', true, 2, 255),
  lastPrice: () => NumberField('Last traded price', 60.8, true, 0.0001, 999999.9999),
  highestPrice: () => NumberField('Highest price of the period', 61.2, true, 0.0001, 999999.9999),
  lowestPrice: () => NumberField('Lowest price of the period', 59.5, true, 0.0001, 999999.9999),
  volume: () => NumberField('Trading volume', 8423783.29, true, 0, 999999999999.99),
  marketType: () => EnumField(MarketTypeEnum, 'Market type', MarketTypeEnum.BIST100, true),
  dailyPercent: () => NumberField('Daily change percentage', 2.18, false, -100, 1000),
  weeklyPercent: () => NumberField('Weekly change percentage', 1.0, false, -100, 1000),
  monthlyPercent: () => NumberField('Monthly change percentage', -5.2, false, -100, 1000),
  yearlyPercent: () => NumberField('Yearly change percentage', -4.15, false, -100, 1000),
};

