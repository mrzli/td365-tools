import { RawDataGrouping, TickerDataResolution } from '../../types';

export interface TickerDataInput {
  readonly dir: string;
  readonly ticker: string;
  readonly resolution: TickerDataResolution;
  readonly grouping: RawDataGrouping;
}
