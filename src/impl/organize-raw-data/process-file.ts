import { compose } from '@gmjs/compose-function';
import { FilePathTextContent } from '@gmjs/fs-shared';
import { join } from '@gmjs/path';
import {
  InstrumentDetails,
  OrganizeRawDataInput,
  TickerDataResolution,
  TickerDataRow,
} from '../../types';
import {
  groupTickerData,
  tickerContentToDataLines,
  tickerDataLineToRow,
  tickerDataLinesToContent,
  tickerDataRowToLine,
} from '../data';
import { applyFn } from '@gmjs/apply-function';
import { map, toArray } from '@gmjs/value-transformers';

export async function processFile(
  input: OrganizeRawDataInput,
  instrument: InstrumentDetails,
  resolution: TickerDataResolution,
  fileContent: string,
): Promise<readonly FilePathTextContent[]> {
  const { outputDataDir, groupingByResolution } = input;
  const { name, dataPrecision } = instrument;

  const finalDir = join(outputDataDir, name, resolution);
  const grouping = groupingByResolution[resolution];

  const dataRows = applyFn(
    fileContent,
    compose(tickerContentToDataLines, map(tickerDataLineToRow), toArray()),
  );

  const groups = groupTickerData(dataRows, grouping);

  return groups.map((group) => ({
    path: join(finalDir, `${group.name}.csv`),
    content: dataRowsToContent(group.data, dataPrecision),
  }));
}

function dataRowsToContent(
  dataRows: readonly TickerDataRow[],
  dataPrecision: number,
): string {
  return applyFn(
    dataRows,
    compose(
      map((row) => tickerDataRowToLine(row, dataPrecision)),
      toArray(),
      tickerDataLinesToContent,
    ),
  );
}
