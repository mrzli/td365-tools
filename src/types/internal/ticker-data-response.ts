import { TickerDataResolution } from './ticker-data-resolution';

export interface TickerDataResponse {
  readonly name: string;
  readonly resolution: TickerDataResolution;
  readonly data: readonly string[];
}
