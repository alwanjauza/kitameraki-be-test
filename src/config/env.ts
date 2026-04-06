import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  COSMOS_ENDPOINT: process.env.COSMOS_ENDPOINT!,
  COSMOS_KEY: process.env.COSMOS_KEY!,
  COSMOS_DATABASE: process.env.COSMOS_DATABASE!,
  COSMOS_CONTAINER_USERS: process.env.COSMOS_CONTAINER_USERS || "Users",
  COSMOS_CONTAINER_TASKS: process.env.COSMOS_CONTAINER_TASKS || "Tasks",
  COSMOS_CONTAINER_SETTINGS:
    process.env.COSMOS_CONTAINER_SETTINGS || "FormSettings",
};

Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});
