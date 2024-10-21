import * as MMDB from "mmdb-lib";
import { promises as fs } from "fs";

export const getMMDB = async () => {
  const mmdbLocation = await fs.readFile(
    process.cwd() + "/public/GeoLite2-Country.mmdb",
  );
  // get current the path to this current file
  //   const mmdbLocation = import.meta.url.replace("file://", "");
  //   const mmdbPath = new URL(mmdbLocation).pathname;

  return new MMDB.Reader<MMDB.CountryResponse>(mmdbLocation);
};
