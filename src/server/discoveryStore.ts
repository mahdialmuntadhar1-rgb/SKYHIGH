import { CanonicalBusiness } from '../types';

let latestRecords: CanonicalBusiness[] = [];

export function setLatestRecords(records: CanonicalBusiness[]) {
  latestRecords = records;
}

export function getLatestRecords() {
  return latestRecords;
}
