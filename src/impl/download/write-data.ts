import { applyFn } from '@gmjs/apply-function';
import { compose } from '@gmjs/compose-function';
import { parseFloatOrThrow } from '@gmjs/number-util';
import { map, reverse, toArray } from '@gmjs/value-transformers';
import { dateIsoToUnixMillis } from '../../util';
import {
  DownloadInput,
  InstrumentDetails,
  TickerDataResolution,
} from '../../types';
import { ensureDirAsync, writeTextAsync } from '@gmjs/fs-async';
import { DateTime } from 'luxon';
import {
  getLatestExistingDatetime,
  getTickerDataFilePath,
} from '../data/existing-data';
import { getIsoDatetimefromDataItem } from './util';

const TICKER_DATA_CSV_HEADER = ['ts', 'date', 'o', 'h', 'l', 'c'].join(',');

export interface WriteDataInput {
  readonly instrument: InstrumentDetails;
  readonly resolution: TickerDataResolution;
  readonly downloadInput: DownloadInput;
  readonly data: readonly string[];
  readonly existingData: readonly string[];
}

export async function writeData(input: WriteDataInput): Promise<void> {
  const { instrument, resolution, downloadInput, data, existingData } = input;
  const { tickerDataDir } = downloadInput;

  let processedData = applyFn(
    data,
    compose(
      map((item) => processDataItem(item, instrument.dataPrecision)),
      reverse(),
      toArray(),
    ),
  );

  if (existingData.length > 0) {
    const latestExistingDate = getLatestExistingDatetime(existingData);
    if (latestExistingDate) {
      processedData = processedData.filter((item) =>
        isAfterLatestExistingDataItem(item, latestExistingDate),
      );
    }
  }

  const tickerData: readonly string[] = [...existingData, ...processedData];

  await writeTickerData(tickerDataDir, instrument.name, resolution, tickerData);
}

async function writeTickerData(
  tickerDataDir: string,
  ticker: string,
  resolution: TickerDataResolution,
  data: readonly string[],
): Promise<void> {
  const filePath = getTickerDataFilePath(tickerDataDir, ticker, resolution);
  const content = [TICKER_DATA_CSV_HEADER, ...data].join('\n');

  await ensureDirAsync(tickerDataDir);

  await writeTextAsync(filePath, content);
}

function processDataItem(item: string, dataPrecision: number): string {
  const datetimeIso = getIsoDatetimefromDataItem(item);
  const ts = DateTime.fromISO(datetimeIso).toUnixInteger();
  const prices: readonly string[] = item
    .split(',')
    .slice(1)
    .map((p) => parseFloatOrThrow(p).toFixed(dataPrecision));
  return [ts.toString(), datetimeIso, ...prices].join(',');
}

function isAfterLatestExistingDataItem(
  item: string,
  latestExistingDate: string,
): boolean {
  return (
    dateIsoToUnixMillis(item.split(',')[1] ?? '') >
    dateIsoToUnixMillis(latestExistingDate)
  );
}
