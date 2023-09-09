import { TickerDataRow } from '../../types';

export function getIsoDatetimefromDataItem(item: string): string {
  return item.split(',')[0]?.replace(' ', 'T').replace('+00:00', '.000Z') ?? '';
}

export function getTickerDataLastValidDatetime(
  data: readonly TickerDataRow[],
): string | undefined {
  if (data.length === 0) {
    return undefined;
  }

  return data.at(-1)?.date;
}
