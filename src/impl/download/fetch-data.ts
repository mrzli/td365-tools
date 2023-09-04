import axios from 'axios';
import {
  DownloadInput,
  InstrumentDetails,
  TickerDataResolution,
} from '../../types';
import { dateIsoToUnixMillis } from '../../util';
import { getIsoDatetimefromDataItem } from './util';

export interface FetchAllDataInput {
  readonly instrument: InstrumentDetails;
  readonly resolution: TickerDataResolution;
  readonly downloadInput: DownloadInput;
  readonly downTo: string | undefined;
}

export async function fetchAllData(
  input: FetchAllDataInput,
): Promise<readonly string[]> {
  const { downloadInput, downTo } = input;
  const { url: baseUrl, fetchLength } = downloadInput;

  const url = getUrl(input);

  const allData: string[] = [];
  let upTo: string | undefined = undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const responseData = await fetchSegment(baseUrl, url, fetchLength, upTo);
    const data = responseData.data;

    if (data.length === 0) {
      printInfo(input, 'No more data to fetch.');
      break;
    }

    const currentUpTo = upTo ?? 'now';
    const currentDownTo = getIsoDatetimefromDataItem(data.at(-1) ?? '');
    printInfo(
      input,
      `Fetched ${data.length} rows, from '${currentUpTo}' down to '${currentDownTo}'.`,
    );
    upTo = currentDownTo;
    allData.push(...data);
    if (
      downTo !== undefined &&
      dateIsoToUnixMillis(downTo) >= dateIsoToUnixMillis(currentDownTo)
    ) {
      printInfo(
        input,
        `Fetched data down to already previously fetched '${downTo}'. No more data will be fetched.`,
      );
      break;
    }
  }

  return allData;
}

async function fetchSegment(
  baseUrl: string,
  url: string,
  fetchLength: number,
  upTo: string | undefined,
): Promise<Td365FetchDataResponse> {
  const response = await axios.get<Td365FetchDataResponse>(url, {
    baseURL: baseUrl,
    params: {
      l: fetchLength,
      m: upTo,
    },
  });

  return response.data;
}

function printInfo(input: FetchAllDataInput, message: string): void {
  const { instrument, resolution } = input;
  const fullMessage = `${instrument.name} - ${resolution}: ${message}`;
  console.log(fullMessage);
}

interface Td365FetchDataResponse {
  readonly last_offset: number;
  readonly data: readonly string[];
}

function getUrl(input: FetchAllDataInput): string {
  const { instrument, resolution } = input;
  const { marketId } = instrument;
  return `data/${resolution}/${marketId}/mid`;
}
