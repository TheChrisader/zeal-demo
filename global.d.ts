import { MongoClient } from "mongodb";
import mongoose from "mongoose";

type MongooseConnection = {
  promise: Promise<typeof mongoose> | typeof mongoose | null;
  conn: Promise<typeof mongoose> | typeof mongoose | null;
};

declare global {
  namespace globalThis {
    // eslint-disable-next-line no-var
    var mongoose: MongooseConnection;
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient>;
  }
}
