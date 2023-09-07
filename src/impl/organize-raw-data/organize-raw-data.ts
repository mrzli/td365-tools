import { filter, lastValueFrom, toArray } from 'rxjs';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import {
  OrganizeRawDataInput,
  TYPES_OF_TICKER_DATA_RESOLUTION,
  TickerDataNameResolution,
  TickerDataResolution,
} from '../../types';
import { processFile } from './process-file';
import { ensureDirAsync, readTextAsync, writeTextAsync } from '@gmjs/fs-async';
import { invariant } from '@gmjs/assert';
import { pathDir, pathFsName } from '@gmjs/path';
import { getInstruments } from '../instruments';
import { applyFn } from '@gmjs/apply-function';
import { map, toMap } from '@gmjs/value-transformers';
import { mapGetOrThrow } from '@gmjs/data-container-util';
import { compose } from '@gmjs/compose-function';

export async function organizeRawData(
  input: OrganizeRawDataInput,
): Promise<void> {
  const { inputDataDir } = input;

  const files: readonly FilePathStats[] = await lastValueFrom(
    fromFindFsEntries(inputDataDir).pipe(
      filter((entry) => entry.stats.isFile()),
      toArray(),
    ),
  );

  const instruments = await getInstruments();
  const instrumentMap = applyFn(
    instruments,
    compose(
      map((instrument) => [instrument.name, instrument] as const),
      toMap(),
    ),
  );

  for (const file of files) {
    const { ticker, resolution } = getTickerDataNameResolution(file);
    const instrument = mapGetOrThrow(instrumentMap, ticker);

    const fileContent = await readTextAsync(file.path);
    const resultFiles = await processFile(
      input,
      instrument,
      resolution,
      fileContent,
    );

    for (const resultFile of resultFiles) {
      const { path: resultPath, content } = resultFile;
      const resultDir = pathDir(resultPath);
      await ensureDirAsync(resultDir);
      await writeTextAsync(resultPath, content);
    }
  }
}

function getTickerDataNameResolution(
  file: FilePathStats,
): TickerDataNameResolution {
  const fileName = pathFsName(file.path);
  const [ticker, resolution] = fileName.split('.');

  invariant(!!ticker, 'File name does not contain ticker name.');
  invariant(!!resolution, 'File name does not contain ticker data resolution.');
  invariant(
    TYPES_OF_TICKER_DATA_RESOLUTION.includes(
      resolution as TickerDataResolution,
    ),
    'Invalid ticker data resolution.',
  );

  return {
    ticker,
    resolution: resolution as TickerDataResolution,
  };
}
