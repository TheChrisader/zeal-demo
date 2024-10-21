import * as MMDB from "mmdb-lib";
import { promises as fs } from "fs";
import path from "path";

export const getMMDB = async () => {
  //   const mmdbLocation = await fs.readFile(
  //     process.cwd() + "/public/GeoLite2-Country.mmdb",
  //   );
  const mmdbLocation = await fs.readFile(
    path.join(process.cwd(), "data/GeoLite2-Country.mmdb"),
  );

  return new MMDB.Reader<MMDB.CountryResponse>(mmdbLocation);
};
