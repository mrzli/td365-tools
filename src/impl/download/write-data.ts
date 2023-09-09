import { applyFn } from '@gmjs/apply-function';
import { compose } from '@gmjs/compose-function';
import { parseFloatOrThrow } from '@gmjs/number-util';
import { map, reverse, toArray } from '@gmjs/value-transformers';
import { dateIsoToUnixMillis } from '../../util';
import {
  DownloadInput,
  InstrumentDetails,
  TickerDataResolution,
  TickerDataRow,
} from '../../types';
import { DateTime } from 'luxon';
import {
  getIsoDatetimefromDataItem,
  getTickerDataLastValidDatetime,
} from './util';
import {
  groupTickerData,
  tickerDataLinesToContent,
  tickerDataRowToLine,
} from '../data';
import { ensureDirAsync, writeTextAsync } from '@gmjs/fs-async';
import { join, pathDir } from '@gmjs/path';

export interface WriteDataInput {
  readonly instrument: InstrumentDetails;
  readonly resolution: TickerDataResolution;
  readonly downloadInput: DownloadInput;
  readonly data: readonly string[];
  readonly existingData: readonly TickerDataRow[];
}

export async function writeData(input: WriteDataInput): Promise<void> {
  const { instrument, resolution, downloadInput, data, existingData } = input;
  const { tickerDataDir, groupingByResolution } = downloadInput;

  let processedData = applyFn(
    data,
    compose(
      map((item) => td365DataLineToDataRow(item)),
      reverse(),
      toArray(),
    ),
  );

  if (existingData.length > 0) {
    const latestExistingDate = getTickerDataLastValidDatetime(existingData);
    if (latestExistingDate) {
      processedData = processedData.filter((item) =>
        isAfterLatestExistingDataItem(item, latestExistingDate),
      );
    }
  }

  const tickerData: readonly TickerDataRow[] = [
    ...existingData,
    ...processedData,
  ];

  const finalDir = join(tickerDataDir, instrument.name, resolution);
  const grouping = groupingByResolution[resolution];

  const groups = groupTickerData(tickerData, grouping);

  const files = groups.map((group) => ({
    path: join(finalDir, `${group.name}.csv`),
    content: dataRowsToContent(group.data, instrument.dataPrecision),
  }));

  for (const file of files) {
    const { path: resultPath, content } = file;
    const resultDir = pathDir(resultPath);
    await ensureDirAsync(resultDir);
    await writeTextAsync(resultPath, content);
  }
}

function td365DataLineToDataRow(item: string): TickerDataRow {
  const datetimeIso = getIsoDatetimefromDataItem(item);
  const ts = DateTime.fromISO(datetimeIso).toUnixInteger();
  const prices: readonly number[] = item
    .split(',')
    .slice(1)
    .map((p) => parseFloatOrThrow(p));

  return {
    date: datetimeIso,
    ts,
    o: prices[0] ?? 0,
    h: prices[1] ?? 0,
    l: prices[2] ?? 0,
    c: prices[3] ?? 0,
  };
}

function isAfterLatestExistingDataItem(
  item: TickerDataRow,
  latestExistingDate: string,
): boolean {
  return (
    dateIsoToUnixMillis(item.date) > dateIsoToUnixMillis(latestExistingDate)
  );
}

function dataRowsToContent(
  dataRows: readonly TickerDataRow[],
  dataPrecision: number,
): string {
  return applyFn(
    dataRows,
    compose(
      map((row) => tickerDataRowToLine(row, dataPrecision)),
      toArray(),
      tickerDataLinesToContent,
    ),
  );
}
