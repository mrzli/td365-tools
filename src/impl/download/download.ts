import {
  DownloadInput,
  InstrumentDetails,
  TYPES_OF_TICKER_DATA_RESOLUTION,
  TickerDataResolution,
} from '../../types';
import { getInstruments } from '../instruments';
import {
  GetExistingDataInput,
  getExistingData,
  getLatestExistingDatetime,
} from './existing-data';
import { FetchAllDataInput, fetchAllData } from './fetch-data';
import { WriteDataInput, writeData } from './write-data';

export async function downloadAllData(input: DownloadInput): Promise<void> {
  console.log('Downloading data...');

  const instruments = await getInstruments();

  for (const instrument of instruments) {
    for (const resolution of TYPES_OF_TICKER_DATA_RESOLUTION) {
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
    downloadInput: input,
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
