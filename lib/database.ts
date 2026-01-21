import mongoose, { Types } from "mongoose";
import { createChildLogger } from "./logger/child-logger";

const logger = createChildLogger("database");

export type Id = Types.ObjectId;
export const newId = (idString?: string | Id) => new Types.ObjectId(idString);

export type UpdateQueryOptions = {
  newDocument?: boolean;
  upsert?: boolean;
};

export type SortParams<D> = Partial<Record<keyof D, 1 | -1>>;

export type QueryOptions<D> = {
  sort?: SortParams<D>;
  limit?: number;
  skip?: number;
};

const {
  DB_USER,
  DB_PASSWORD,
  DB_IP,
  DB_CLUSTER,
  DB_NAME,
  DB_PORT,
  DB_REPLICA_SET,
  DB_AUTH_SOURCE,
} = process.env;

export const getMongoDBURI = () => {
  if (!DB_CLUSTER && !DB_USER && !DB_PASSWORD) {
    if (!DB_NAME) {
      throw new Error(
        "Please define the DB_NAME environment variable inside .env.local",
      );
    }
    return `mongodb://127.0.0.1:${DB_PORT || "27017"}/${DB_NAME}?retryWrites=true&w=majority`;
  }
  if (DB_IP && DB_PORT && DB_REPLICA_SET && DB_AUTH_SOURCE) {
    return `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_IP}:${DB_PORT}/${DB_NAME}?replicaSet=${DB_REPLICA_SET}&authSource=${DB_AUTH_SOURCE}&retryWrites=true&w=majority`;
  }
  return `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
};

const MONGODB_URI = getMongoDBURI();

if (!MONGODB_URI) {
  throw new Error(
    "Wrong MONGODB_URI. Please define the environment variables inside .env.local",
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = {
    conn: null,
    promise: null,
  };

  global.mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectToDatabase = async () => {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    // if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        logger.info("MongoDB connected");
        cached.conn = mongoose;
        return mongoose;
      })
      .catch((error) => {
        if (
          error.name === "MongoNetworkError" ||
          error.name === "MongoServerSelectionError"
        ) {
          logger.error(error, "MongoDB connection failed");
        }
        cached.promise = null;
        throw error;
      });
    // }

    // cached.conn = await cached.promise;
    // return cached.conn;
    return await cached.promise;
  } catch (error) {
    logger.error(error, "MongoDB connection error");
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};

// setInterval(() => {
//   console.log(
//     `Active connections: ${mongoose.connections.base.connections.length}`,
//   );
// }, 5000);
