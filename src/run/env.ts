import { z } from 'zod';

const ENV_SCHEMA = z.object({
  TD365_USERNAME: z.string().email(),
  TD365_PASSWORD: z.string(),
  TD365_CLIENT_ID: z.string(),
  TD365_ACCOUNT_ID: z.string().regex(/^\d+$/),
});

type EnvRaw = z.infer<typeof ENV_SCHEMA>;

export interface Env {
  readonly td365Username: string;
  readonly td365Password: string;
  readonly td365ClientId: string;
  readonly td365AccountId: string;
}

export function parseEnv(env: NodeJS.ProcessEnv): Env {
  const raw = ENV_SCHEMA.parse(env);
  return envRawToEnv(raw);
}

function envRawToEnv(raw: EnvRaw): Env {
  return {
    td365Username: raw.TD365_USERNAME,
    td365Password: raw.TD365_PASSWORD,
    td365ClientId: raw.TD365_CLIENT_ID,
    td365AccountId: raw.TD365_ACCOUNT_ID,
  };
}
