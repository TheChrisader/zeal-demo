import { IDB_KEY } from "./constants";
import { IndexedDBConfig, IndexedDBStore } from "./interfaces";
import { waitUntil } from "./utils";

interface WindowWithIDBKey extends Window {
  [IDB_KEY]: {
    init: number;
    config: IndexedDBConfig;
  };
}

function validateStore(db: IDBDatabase, storeName: string) {
  return db.objectStoreNames.contains(storeName);
}

export function validateBeforeTransaction(
  db: IDBDatabase,
  storeName: string,
  reject: (reason: string) => void,
) {
  if (!db) {
    reject("Queried before opening connection");
  }
  if (!validateStore(db, storeName)) {
    reject(`Store ${storeName} not found`);
  }
}

export function createTransaction(
  db: IDBDatabase,
  dbMode: IDBTransactionMode,
  currentStore: string,
  //   type resolve
): IDBTransaction {
  const tx: IDBTransaction = db.transaction(currentStore, dbMode);
  tx.onerror = (ev: Event) => {
    console.log("Transaction error: ", ev);
  };

  tx.oncomplete = (ev: Event) => {
    console.log("Transaction complete.");
  };

  tx.onabort = (ev: Event) => {
    console.log("Transaction aborted.", ev);
  };
  return tx;
}

export async function getConnection(
  config?: IndexedDBConfig,
): Promise<IDBDatabase | undefined> {
  const idbInstance = typeof window !== "undefined" ? window.indexedDB : null;
  let _config = config;

  if (!config && idbInstance) {
    await waitUntil(
      () => (window as unknown as WindowWithIDBKey)?.[IDB_KEY]?.["init"] === 1,
    );
    _config = (window as unknown as WindowWithIDBKey)[IDB_KEY]?.["config"];
  }

  return new Promise<IDBDatabase | undefined>((resolve, reject) => {
    if (idbInstance) {
      const request: IDBOpenDBRequest = idbInstance.open(
        _config!.databaseName,
        _config!.version,
      );

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e: Event) => {
        reject((e.target as IDBRequest)?.error?.name);
      };

      request.onupgradeneeded = (e: Event) => {
        const db = (e.target as IDBRequest)?.result;
        config!.stores.forEach((s) => {
          if (!db.objectStoreNames.contains(s.name)) {
            const store = db.createObjectStore(s.name, s.id);
            s.indices.forEach((c) => {
              store.createIndex(c.name, c.keyPath, c.options);
            });
          }
        });
        db.close();
        resolve(undefined);
      };
    } else {
      reject("Failed to connect");
    }
  });
}

export function getActions<T>(currentStore: string) {
  return {
    getByID(id: string | number) {
      return new Promise<T>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readonly", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const request = objectStore.get(id);
            request.onsuccess = (e: Event) => {
              resolve((e.target as IDBRequest).result as T);
            };
          })
          .catch(reject);
      });
    },
    getOneByKey(keyPath: string, value: string | number) {
      return new Promise<T | undefined>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readonly", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const index = objectStore.index(keyPath);
            const request = index.get(value);
            request.onsuccess = (e: Event) => {
              resolve((e.target as IDBRequest).result as T);
            };
          })
          .catch(reject);
      });
    },
    getManyByKey(keyPath: string, value: string | number) {
      return new Promise<T[]>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readonly", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const index = objectStore.index(keyPath);
            const request = index.getAll(value);
            request.onsuccess = (e: Event) => {
              resolve((e.target as IDBRequest).result as T[]);
            };
          })
          .catch(reject);
      });
    },
    getAll() {
      return new Promise<T[]>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readonly", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const request = objectStore.getAll();
            request.onsuccess = (e: Event) => {
              resolve((e.target as IDBRequest)?.result as T[]);
            };
          })
          .catch(reject);
      });
    },

    add(value: T, key?: string | number) {
      return new Promise<string | number>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readwrite", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const request = objectStore.add(value, key);
            request.onsuccess = (e: Event) => {
              (tx as IDBTransaction)?.commit?.();
              resolve((e.target as IDBRequest)?.result);
            };
          })
          .catch(reject);
      });
    },

    update(value: T, key?: string | number) {
      return new Promise<string | number>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readwrite", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const request = objectStore.put(value, key);
            request.onsuccess = (e: Event) => {
              (tx as IDBTransaction)?.commit?.();
              resolve((e.target as IDBRequest).result);
            };
          })
          .catch(reject);
      });
    },

    deleteByID(id: string | number) {
      return new Promise<undefined>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readwrite", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const request = objectStore.delete(id);
            request.onsuccess = (e: Event) => {
              (tx as IDBTransaction)?.commit?.();
              resolve((e.target as IDBRequest)?.result);
            };
          })
          .catch(reject);
      });
    },
    deleteAll() {
      return new Promise<undefined>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readwrite", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const request = objectStore.clear();
            request.onsuccess = (e: Event) => {
              (tx as IDBTransaction)?.commit?.();
              resolve((e.target as IDBRequest)?.result);
            };
          })
          .catch(reject);
      });
    },

    openCursor(cursorCallback: (e: Event) => void, keyRange?: IDBKeyRange) {
      return new Promise<IDBCursorWithValue | void>((resolve, reject) => {
        getConnection()
          .then((db) => {
            validateBeforeTransaction(db!, currentStore, reject);
            const tx = createTransaction(db!, "readonly", currentStore);
            const objectStore = tx.objectStore(currentStore);
            const request = objectStore.openCursor(keyRange);
            request.onsuccess = (e) => {
              cursorCallback(e);
              resolve();
            };
          })
          .catch(reject);
      });
    },
  };
}
