import { DownloadInput } from '../types';
import { getInstruments } from './instruments';

export async function downloadAllData(input: DownloadInput): Promise<void> {
  console.log('Downloading data...');

  console.log(input);

  const instruments = await getInstruments();
  console.log(instruments);
}
