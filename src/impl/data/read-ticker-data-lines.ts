import { existsAsync, readTextAsync } from '@gmjs/fs-async';
import { TickerDataInput } from './ticker-data-input';
import { getTickerDataFilePath } from './ticker-path';
import { tickerContentToDataLines } from './ticker-data-converter';

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
