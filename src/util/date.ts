import { DateTime } from 'luxon';

export function dateIsoToUnixMillis(dateIso: string): number {
  return DateTime.fromISO(dateIso).toMillis();
}

export function timestampToDatetimeUtc(ts: number): DateTime {
  return DateTime.fromSeconds(ts).setZone('UTC');
}

export function timestampToIsoDatetime(ts: number): string | undefined {
  return timestampToDatetimeUtc(ts).toISO({ suppressMilliseconds: true }) ?? undefined;
}

export function timestampToIsoDate(ts: number): string | undefined {
  return timestampToDatetimeUtc(ts).toISODate() ?? undefined;
}

export function dateIsoToHourMinuteUtc(dateIso: string): string {
  return DateTime.fromISO(dateIso).setZone('UTC').toFormat('HH:mm');
}
