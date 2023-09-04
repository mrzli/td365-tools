export const TYPES_OF_TICKER_DATA_RESOLUTION = [
  'day',
  'quarter',
  'minute',
] as const;

export type TickerDataResolution =
  (typeof TYPES_OF_TICKER_DATA_RESOLUTION)[number];
