export function getIsoDatetimefromDataItem(item: string): string {
  return item.split(',')[0]?.replace(' ', 'T').replace('+00:00', '.000Z') ?? '';
}
