import * as MMDB from "mmdb-lib";
import { promises as fs } from "fs";

export const getMMDB = async () => {
  const mmdbLocation = await fs.readFile("./GeoLite2-Country.mmdb");

  return new MMDB.Reader<MMDB.CountryResponse>(mmdbLocation);
};
