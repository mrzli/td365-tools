import { join } from 'node:path';
import { existsAsync, readTextAsync } from '@gmjs/fs-async';
import {
  InstrumentDetails,
  TickerDataResolution,
  TickerDataRow,
} from '../../types';
import { parseIntegerOrThrow, parseFloatOrThrow } from '@gmjs/number-util';

export interface GetExistingDataInput {
  readonly instrument: InstrumentDetails;
  readonly resolution: TickerDataResolution;
  readonly tickerDataDir: string;
}

export async function getExistingData(
  input: GetExistingDataInput,
): Promise<readonly string[]> {
  const dataExists = await tickerDataExists(input);
  if (!dataExists) {
    return [];
  }

  return await getTickerDataLines(input);
}

export function getLatestExistingDatetime(
  existingData: readonly string[],
): string | undefined {
  if (existingData.length === 0) {
    return undefined;
  }

  return existingData.at(-1)?.split(',')[1];
}

async function tickerDataExists(input: GetExistingDataInput): Promise<boolean> {
  const { instrument, resolution, tickerDataDir } = input;

  return await existsAsync(
    getTickerDataFilePath(tickerDataDir, instrument.name, resolution),
  );
}

async function getTickerDataLines(
  input: GetExistingDataInput,
): Promise<readonly string[]> {
  const { instrument, resolution, tickerDataDir } = input;

  const allText = await readTextAsync(
    getTickerDataFilePath(tickerDataDir, instrument.name, resolution),
  );
  return tickerContentToDataLines(allText);
}

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

function tickerContentToDataLines(content: string): readonly string[] {
  const lines = content.split('\n').filter((l) => l.trim() !== '');
  return lines.length > 0 ? lines.slice(1) : [];
}

export async function getTickerDataRows(
  input: GetExistingDataInput,
): Promise<readonly TickerDataRow[]> {
  const { instrument, resolution, tickerDataDir } = input;

  const allText = await readTextAsync(
    getTickerDataFilePath(tickerDataDir, instrument.name, resolution),
  );
  return tickerContentToDataRows(allText);
}

function tickerContentToDataRows(content: string): readonly TickerDataRow[] {
  const lines = tickerContentToDataLines(content);
  return lines.map((line) => tickerDataLineToRow(line));
}

function tickerDataLineToRow(line: string): TickerDataRow {
  const parts = line.split(',');

  return {
    ts: parseIntegerOrThrow(parts[0] ?? ''),
    date: parts[1] ?? '',
    o: parseFloatOrThrow(parts[2] ?? ''),
    h: parseFloatOrThrow(parts[3] ?? ''),
    l: parseFloatOrThrow(parts[4] ?? ''),
    c: parseFloatOrThrow(parts[5] ?? ''),
  };
}
