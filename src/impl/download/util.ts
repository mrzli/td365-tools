export function getIsoDatetimefromDataItem(item: string): string {
  return item.split(',')[0]?.replace(' ', 'T').replace('+00:00', '.000Z') ?? '';
}

export function getTickerDataLatestDatetime(
  data: readonly string[],
): string | undefined {
  if (data.length === 0) {
    return undefined;
  }

  return data.at(-1)?.split(',')[1];
}
