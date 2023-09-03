import { readTextAsync } from '@gmjs/fs-async';
import { InstrumentDetails } from '../types';

export async function getInstruments(): Promise<readonly InstrumentDetails[]> {
  const content = await readTextAsync('src/config/instruments.json');
  return JSON.parse(content);
}
