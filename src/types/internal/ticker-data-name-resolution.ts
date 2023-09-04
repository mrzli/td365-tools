import { TickerDataResolution } from './ticker-data-resolution';

export interface TickerDataNameResolution {
  readonly name: string;
  readonly resolution: TickerDataResolution;
}
