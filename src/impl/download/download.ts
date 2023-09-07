import {
  DownloadInput,
  InstrumentDetails,
  TickerDataResolution,
} from '../../types';
import { TickerDataInput, readTickerDataLines } from '../data';
import { FetchAllDataInput, fetchAllData } from './fetch-data';
import { getTickerDataLatestDatetime } from './util';
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

async function downloadData(
  input: DownloadInput,
  instrument: InstrumentDetails,
  resolution: TickerDataResolution,
): Promise<void> {
  const tickerDataInput: TickerDataInput = {
    dir: input.tickerDataDir,
    ticker: instrument.name,
    resolution,
  };

  const existingData = await readTickerDataLines(tickerDataInput);
  const downTo = getTickerDataLatestDatetime(existingData);

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
    existingData,
  };

  await writeData(writeInput);
}
