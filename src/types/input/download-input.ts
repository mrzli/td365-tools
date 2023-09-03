import { Td365AuthData } from "./td365-auth-data";

export interface DownloadInput {
  readonly url: string;
  readonly fetchLength: number;
  readonly authData: Td365AuthData;
}