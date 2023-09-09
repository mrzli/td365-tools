import { TickerDataRow } from "./ticker-data-row";

export interface TickerDataGroup {
  readonly name: string;
  readonly data: readonly TickerDataRow[];
}
