import { parseIntegerOrThrow, parseFloatOrThrow } from '@gmjs/number-util';
import { TickerDataRow } from '../../types';

const TICKER_DATA_CSV_HEADER = ['ts', 'date', 'o', 'h', 'l', 'c'].join(',');

export function tickerContentToDataLines(content: string): readonly string[] {
  const lines = content.split('\n').filter((l) => l.trim() !== '');
  return lines.length > 0 ? lines.slice(1) : [];
}

export function tickerDataLinesToContent(lines: readonly string[]): string {
  return [TICKER_DATA_CSV_HEADER, ...lines].join('\n') + '\n';
}

export function tickerDataLineToRow(line: string): TickerDataRow {
  const parts = line.split(',');

  return {
    ts: parseIntegerOrThrow(parts[0] ?? ''),
    date: parts[1] ?? '',
    o: parseFloatOrThrow(parts[2] ?? ''),
    h: parseFloatOrThrow(parts[3] ?? ''),
    l: parseFloatOrThrow(parts[4] ?? ''),
    c: parseFloatOrThrow(parts[5] ?? ''),
  };
}

export function tickerDataRowToLine(
  row: TickerDataRow,
  dataPrecision: number,
): string {
  const { ts, date, o, h, l, c } = row;
  const prices = [o, h, l, c].map((p) => p.toFixed(dataPrecision));
  return [ts.toString(), date, ...prices].join(',');
}
