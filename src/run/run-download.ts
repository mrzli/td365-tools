import dotenv from 'dotenv';
import { parseEnv } from './env';
import { downloadAllData } from '../impl';
import { DownloadInput, TYPES_OF_TICKER_DATA_RESOLUTION } from '../types';
import { getInstruments } from '../impl/instruments';

dotenv.config({ path: '.env.local' });

export async function run(): Promise<void> {
  const env = parseEnv(process.env);

  const instruments = await getInstruments();

  const input: DownloadInput = {
    url: 'https://charts.finsa.com.au',
    fetchLength: 1000,
    tickerDataDir:
      'C:\\Users\\Mrzli\\Development\\Projects\\private\\projects\\js\\trading\\td365-data-raw\\data',
    authData: {
      username: env.td365Username,
      password: env.td365Password,
      clientId: env.td365ClientId,
      accountId: env.td365AccountId,
    },
    instruments,
    resolutions: TYPES_OF_TICKER_DATA_RESOLUTION,
  };

  await downloadAllData(input);
}

run().then(() => {
  console.log('Finished!');
});
