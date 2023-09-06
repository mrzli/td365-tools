import { filter, lastValueFrom, toArray } from 'rxjs';
import { fromFindFsEntries } from '@gmjs/fs-observable';
import { FilePathStats } from '@gmjs/fs-shared';
import { OrganizeRawDataInput } from '../../types';
import { processFile } from './process-file';
import { readTextAsync } from '@gmjs/fs-async';

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

  for (const file of files) {
    const fileContent = await readTextAsync(file.path);
    const resultFiles = await processFile(input, file, fileContent);

    // console.log(resultFiles);
  }
}
