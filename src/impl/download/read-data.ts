import { existsAsync, readTextAsync } from '@gmjs/fs-async';
import { getTickerDataFilePath, tickerContentToDataLines } from '../data';
import { TickerDataInput } from './types';

export async function readTickerDataLines(
  input: TickerDataInput,
): Promise<readonly string[]> {
  const { dir, ticker, resolution } = input;

  const filePath = getTickerDataFilePath(dir, ticker, resolution);
  const fileExists = await existsAsync(filePath);
  if (!fileExists) {
    return [];
  }

  const content = await readTextAsync(
    getTickerDataFilePath(dir, ticker, resolution),
  );

  return tickerContentToDataLines(content);
}
