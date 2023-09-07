import { compose } from '@gmjs/compose-function';
import { FilePathTextContent } from '@gmjs/fs-shared';
import { join } from '@gmjs/path';
import { invariant } from '@gmjs/assert';
import {
  InstrumentDetails,
  OrganizeRawDataInput,
  TickerDataResolution,
  TickerDataRow,
} from '../../types';
import {
  tickerContentToDataLines,
  tickerDataLineToRow,
  tickerDataLinesToContent,
  tickerDataRowToLine,
} from '../data';
import { applyFn } from '@gmjs/apply-function';
import { groupBy, map, toArray } from '@gmjs/value-transformers';

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

  switch (grouping) {
    case 'all': {
      return getGroupingAllResult(finalDir, dataRows, dataPrecision);
    }
    case 'year': {
      return getGroupingByTimePeriodResult(
        finalDir,
        dataRows,
        dataPrecision,
        getRowYear,
      );
    }
    case 'month': {
      return getGroupingByTimePeriodResult(
        finalDir,
        dataRows,
        dataPrecision,
        getRowYearMonth,
      );
    }
    case 'day': {
      return getGroupingByTimePeriodResult(
        finalDir,
        dataRows,
        dataPrecision,
        getRowYearMonthDay,
      );
    }
    default: {
      invariant(false, `Invalid grouping: '${grouping}'.`);
    }
  }
}

function getGroupingAllResult(
  outputDir: string,
  dataRows: readonly TickerDataRow[],
  dataPrecision: number,
): readonly FilePathTextContent[] {
  return [
    {
      path: join(outputDir, 'all.csv'),
      content: dataRowsToContent(dataRows, dataPrecision),
    },
  ];
}

function getGroupingByTimePeriodResult(
  outputDir: string,
  dataRows: readonly TickerDataRow[],
  dataPrecision: number,
  timePeriodSelector: (row: TickerDataRow) => string,
): readonly FilePathTextContent[] {
  const rowsByTimePeriod = applyFn(
    dataRows,
    compose(
      groupBy((row) => timePeriodSelector(row)),
      toArray(),
    ),
  );

  return rowsByTimePeriod.map((entry) => {
    const [timePeriod, rows] = entry;
    return {
      path: join(outputDir, `${timePeriod}.csv`),
      content: dataRowsToContent(rows, dataPrecision),
    };
  });
}

function getRowYear(row: TickerDataRow): string {
  return row.date.slice(0, 4);
}

function getRowYearMonth(row: TickerDataRow): string {
  return row.date.slice(0, 7);
}

function getRowYearMonthDay(row: TickerDataRow): string {
  return row.date.slice(0, 10);
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
