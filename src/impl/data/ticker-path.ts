import { join } from "@gmjs/path";
import { TickerDataResolution } from "../../types";

export function getTickerDataFilePath(
  tickerDataDir: string,
  ticker: string,
  resolution: TickerDataResolution,
): string {
  return join(tickerDataDir, getTickerDataCsvFileName(ticker, resolution));
}

function getTickerDataCsvFileName(
  ticker: string,
  resolution: TickerDataResolution,
): string {
  return `${ticker}.${resolution}.csv`;
}