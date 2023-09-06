import { RawDataGrouping } from './raw-data-grouping';
import { TickerDataResolution } from './ticker-data-resolution';

export type RawDataGroupingByResolution = Readonly<
  Record<TickerDataResolution, RawDataGrouping>
>;
