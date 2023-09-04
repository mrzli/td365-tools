import dotenv from 'dotenv';
import { parseEnv } from './env';
import { downloadAllData } from '../impl';
import { DownloadInput } from '../types';

dotenv.config({ path: '.env.local' });

export async function run(): Promise<void> {
  const env = parseEnv(process.env);

  const input: DownloadInput = {
    url: 'https://charts.finsa.com.au',
    fetchLength: 1000,
    tickerDataDir: 'data',
    authData: {
      username: env.td365Username,
      password: env.td365Password,
      clientId: env.td365ClientId,
      accountId: env.td365AccountId,
    },
  };

  await downloadAllData(input);
}

run().then(() => {
  console.log('Finished!');
});
