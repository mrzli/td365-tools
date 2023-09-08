import dotenv from 'dotenv';
// import { parseEnv } from './env';
import { organizeRawData } from '../impl/organize-raw-data';
import { OrganizeRawDataInput } from '../types';

dotenv.config({ path: '.env.local' });

export async function run(): Promise<void> {
  // const env = parseEnv(process.env);

  // const instruments = await getInstruments();

  // const input: DownloadInput = {
  //   url: 'https://charts.finsa.com.au',
  //   fetchLength: 1000,
  //   tickerDataDir: 'data',
  //   authData: {
  //     username: env.td365Username,
  //     password: env.td365Password,
  //     clientId: env.td365ClientId,
  //     accountId: env.td365AccountId,
  //   },
  //   instruments,
  //   resolutions: TYPES_OF_TICKER_DATA_RESOLUTION,
  // };

  const input: OrganizeRawDataInput = {
    inputDataDir: 'data',
    outputDataDir: 'C:\\Users\\Mrzli\\Development\\Projects\\private\\projects\\js\\trading\\td365-data-raw\\data',
    groupingByResolution: {
      minute: 'month',
      quarter: 'year',
      day: 'all',
    },
  };

  await organizeRawData(input);
}

run().then(() => {
  console.log('Finished!');
});
