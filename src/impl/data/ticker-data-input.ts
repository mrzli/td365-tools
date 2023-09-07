import { TickerDataResolution } from '../../types';

export interface TickerDataInput {
  readonly dir: string;
  readonly ticker: string;
  readonly resolution: TickerDataResolution;
}
