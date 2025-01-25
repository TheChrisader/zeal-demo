import { Collection, MongoClient } from "mongodb";
import { Id } from "../database";

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

interface UserDoc {
  _id: Id | string;
}
interface SessionDoc {
  _id: string;
  expires_at: Date;
  user_id: Id | string;
}

export let userCollection: Collection<UserDoc>;
export let sessionCollection: Collection<SessionDoc>;

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

const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise: Promise<MongoClient>;
    _mongoUsersCollection: Collection<UserDoc>;
    _mongoSessionsCollection: Collection<SessionDoc>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    globalWithMongo._mongoClientPromise = client.connect();

    globalWithMongo._mongoUsersCollection = client.db().collection("users");
    globalWithMongo._mongoSessionsCollection = client
      .db()
      .collection("sessions");
  }

  clientPromise = globalWithMongo._mongoClientPromise;
  sessionCollection = globalWithMongo._mongoSessionsCollection;
  userCollection = globalWithMongo._mongoUsersCollection;
} else {
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();

  userCollection = client.db().collection("users");
  sessionCollection = client.db().collection("sessions");
}

export default clientPromise;
