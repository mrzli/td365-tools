import {
  DownloadInput,
  InstrumentDetails,
  TickerDataResolution,
} from '../../types';
import { FetchAllDataInput, fetchAllData } from './fetch-data';
import { readTickerDataRows } from './read-data';
import { TickerDataInput } from './types';
import { getTickerDataLastValidDatetime } from './util';
import { WriteDataInput, writeData } from './write-data';

export async function downloadAllData(input: DownloadInput): Promise<void> {
  await downloadAllDataInternal(input);
}

export async function downloadAllDataInternal(
  input: DownloadInput,
): Promise<void> {
  console.log('Downloading data...');
  const { instruments, resolutions } = input;

  for (const instrument of instruments) {
    for (const resolution of resolutions) {
      await downloadData(input, instrument, resolution);
    }
  }
}

const REFETCH_LAST_N = 500;

async function downloadData(
  input: DownloadInput,
  instrument: InstrumentDetails,
  resolution: TickerDataResolution,
): Promise<void> {
  const tickerDataInput: TickerDataInput = {
    dir: input.tickerDataDir,
    ticker: instrument.name,
    resolution,
    grouping: input.groupingByResolution[resolution],
  };

  const existingData = await readTickerDataRows(tickerDataInput);
  const finalExistingData = existingData.slice(0, -REFETCH_LAST_N);

  const downTo = getTickerDataLastValidDatetime(finalExistingData);

  const fetchInput: FetchAllDataInput = {
    instrument,
    resolution,
    downloadInput: input,
    downTo,
  };

  const data = await fetchAllData(fetchInput);

  const writeInput: WriteDataInput = {
    instrument,
    resolution,
    downloadInput: input,
    data,
    existingData: finalExistingData,
  };

  await writeData(writeInput);
}
