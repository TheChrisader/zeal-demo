import { useMemo } from "react";

import { IDB_KEY } from "./constants";
import { getActions, getConnection } from "./db";
import { IndexedDBConfig } from "./interfaces";

interface WindowWithIDBKey extends Window {
  [IDB_KEY]: {
    init: number;
    config: IndexedDBConfig;
  };
}

async function setupIndexedDB(config: IndexedDBConfig) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      await getConnection(config);
      // console.log("inside Init", config);
      (window as unknown as WindowWithIDBKey)[IDB_KEY] = { init: 1, config };
      resolve();
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

export function useIndexedDBStore<T>(storeName: string) {
  const _actions = useMemo(() => getActions<T>(storeName), [storeName]);
  return _actions;
}

export default setupIndexedDB;
