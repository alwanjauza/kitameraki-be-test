import { CosmosClient } from "@azure/cosmos";
import { env } from "../config/env";

const client = new CosmosClient({
  endpoint: env.COSMOS_ENDPOINT,
  key: env.COSMOS_KEY,
});

export const container = client
  .database(env.COSMOS_DATABASE)
  .container(env.COSMOS_CONTAINER);
