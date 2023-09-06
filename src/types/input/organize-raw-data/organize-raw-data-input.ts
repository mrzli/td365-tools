import { RawDataGroupingByResolution } from "../../internal";

export interface OrganizeRawDataInput {
  readonly inputDataDir: string;
  readonly outputDataDir: string;
  readonly groupingByResolution: RawDataGroupingByResolution;
}
