export const RAW_DATA_GROUPING_LIST = ['all', 'year', 'month', 'day'] as const;

export type RawDataGrouping = (typeof RAW_DATA_GROUPING_LIST)[number];
