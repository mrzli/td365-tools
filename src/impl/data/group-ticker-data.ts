import { compose } from '@gmjs/compose-function';
import { invariant } from '@gmjs/assert';
import { RawDataGrouping, TickerDataGroup, TickerDataRow } from '../../types';
import { applyFn } from '@gmjs/apply-function';
import { groupBy, toArray } from '@gmjs/value-transformers';

export function groupTickerData(
  dataRows: readonly TickerDataRow[],
  grouping: RawDataGrouping,
): readonly TickerDataGroup[] {
  switch (grouping) {
    case 'all': {
      return getGroupingAllResult(dataRows);
    }
    case 'year': {
      return getGroupingByTimePeriodResult(dataRows, getRowYear);
    }
    case 'month': {
      return getGroupingByTimePeriodResult(dataRows, getRowYearMonth);
    }
    case 'day': {
      return getGroupingByTimePeriodResult(dataRows, getRowYearMonthDay);
    }
    default: {
      invariant(false, `Invalid grouping: '${grouping}'.`);
    }
  }
}

function getGroupingAllResult(
  dataRows: readonly TickerDataRow[],
): readonly TickerDataGroup[] {
  return [
    {
      name: 'all',
      data: dataRows,
    },
  ];
}

function getGroupingByTimePeriodResult(
  dataRows: readonly TickerDataRow[],
  timePeriodSelector: (row: TickerDataRow) => string,
): readonly TickerDataGroup[] {
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
      name: timePeriod,
      data: rows,
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
