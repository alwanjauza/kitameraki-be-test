import { CosmosClient } from "@azure/cosmos";
import { env } from "../config/env";

const client = new CosmosClient({
  endpoint: env.COSMOS_ENDPOINT,
  key: env.COSMOS_KEY,
});

const database = client.database(env.COSMOS_DATABASE);

export const usersContainer = database.container(env.COSMOS_CONTAINER_USERS);
export const tasksContainer = database.container(env.COSMOS_CONTAINER_TASKS);
export const settingsContainer = database.container(
  env.COSMOS_CONTAINER_SETTINGS,
);
