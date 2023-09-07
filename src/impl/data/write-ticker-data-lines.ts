import { ensureDirAsync, writeTextAsync } from '@gmjs/fs-async';
import { TickerDataInput } from './ticker-data-input';
import { getTickerDataFilePath } from './ticker-path';
import { tickerDataLinesToContent } from './ticker-data-converter';

export async function writeTickerDataLines(
  input: TickerDataInput,
  data: readonly string[],
): Promise<void> {
  const { dir, ticker, resolution } = input;

  const filePath = getTickerDataFilePath(dir, ticker, resolution);
  const content = tickerDataLinesToContent(data);

  await ensureDirAsync(dir);

  await writeTextAsync(filePath, content);
}
