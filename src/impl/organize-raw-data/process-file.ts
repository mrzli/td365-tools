import { FilePathStats, FilePathTextContent } from '@gmjs/fs-shared';
import { join, pathFsName } from '@gmjs/path';
import { invariant } from '@gmjs/assert';
import {
  OrganizeRawDataInput,
  TYPES_OF_TICKER_DATA_RESOLUTION,
  TickerDataNameResolution,
  TickerDataResolution,
} from '../../types';

export async function processFile(
  input: OrganizeRawDataInput,
  file: FilePathStats,
  fileContent: string
): Promise<readonly FilePathTextContent[]> {
  const { outputDataDir, groupingByResolution } = input;

  const { name, resolution } = getTickerDataNameResolution(file);

  const finalDir = join(outputDataDir, name, resolution);
  const grouping = groupingByResolution[resolution];



  return [];
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
    name: ticker,
    resolution: resolution as TickerDataResolution,
  };
}

// function
