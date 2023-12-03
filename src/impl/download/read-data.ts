import { existsAsync, readTextAsync } from '@gmjs/fs-async';
import { tickerContentToDataLines, tickerDataLineToRow } from '../data';
import { TickerDataInput } from './types';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import { lastValueFrom, filter, toArray as rxjsToArray } from 'rxjs';
import { join } from '@gmjs/path';
import { applyFn } from '@gmjs/apply-function';
import { compose } from '@gmjs/compose-function';
import { sortArray } from '@gmjs/array-sort';
import { map, reverse, take, toArray } from '@gmjs/value-transformers';
import { TickerDataRow } from '../../types';

export async function readTickerDataRows(
  input: TickerDataInput,
): Promise<readonly TickerDataRow[]> {
  const { dir, ticker, resolution } = input;

  const tickerResolutionDir = join(dir, ticker, resolution);

  const dirExists = await existsAsync(tickerResolutionDir);
  if (!dirExists) {
    return [];
  }

  const files: readonly FilePathStats[] = await lastValueFrom(
    fromFindFsEntries(tickerResolutionDir).pipe(
      filter((entry) => entry.stats.isFile()),
      rxjsToArray(),
    ),
  );

  if (files.length === 0) {
    return [];
  }

  const lastFiles = applyFn(
    files,
    compose(
      (entries) =>
        sortArray(entries, (p1, p2) => p2.path.localeCompare(p1.path)),
      take(2),
      reverse(), // bringing files back into chronological order
      toArray(),
    ),
  );

  const contents = await Promise.all(
    lastFiles.map((file) => readTextAsync(file.path)),
  );

  const dataRows = contents.reduce<readonly TickerDataRow[]>(
    (result, content) => [...result, ...contentToDataRows(content)],
    [],
  );

  return dataRows;
}

function contentToDataRows(content: string): readonly TickerDataRow[] {
  return applyFn(
    content,
    compose(tickerContentToDataLines, map(tickerDataLineToRow), toArray()),
  );
}
