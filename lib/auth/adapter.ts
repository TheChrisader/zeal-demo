import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { sessionCollection, userCollection } from "./mongodb";

export const adapter = new MongodbAdapter(sessionCollection, userCollection);
