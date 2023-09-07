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
import { DateTime } from 'luxon';
import {
  getIsoDatetimefromDataItem,
  getTickerDataLatestDatetime,
} from './util';
import { TickerDataInput, writeTickerDataLines } from '../data';

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
    const latestExistingDate = getTickerDataLatestDatetime(existingData);
    if (latestExistingDate) {
      processedData = processedData.filter((item) =>
        isAfterLatestExistingDataItem(item, latestExistingDate),
      );
    }
  }

  const tickerData: readonly string[] = [...existingData, ...processedData];

  const writeInput: TickerDataInput = {
    dir: tickerDataDir,
    ticker: instrument.name,
    resolution,
  };

  await writeTickerDataLines(writeInput, tickerData);
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
