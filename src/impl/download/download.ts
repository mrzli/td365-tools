import {
  DownloadInput,
  InstrumentDetails,
  TickerDataResolution,
} from '../../types';
import {
  GetExistingDataInput,
  getExistingData,
  getLatestExistingDatetime,
} from '../data/existing-data';
import { FetchAllDataInput, fetchAllData } from './fetch-data';
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
  const existingDataInput: GetExistingDataInput = {
    instrument,
    resolution,
    tickerDataDir: input.tickerDataDir,
  };

  const existingData = await getExistingData(existingDataInput);
  const downTo = getLatestExistingDatetime(existingData);

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
