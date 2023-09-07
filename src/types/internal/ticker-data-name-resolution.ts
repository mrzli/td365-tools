import { TickerDataResolution } from './ticker-data-resolution';

export interface TickerDataNameResolution {
  readonly ticker: string;
  readonly resolution: TickerDataResolution;
}
