import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  COSMOS_ENDPOINT: process.env.COSMOS_ENDPOINT!,
  COSMOS_KEY: process.env.COSMOS_KEY!,
  COSMOS_DATABASE: process.env.COSMOS_DATABASE!,
  COSMOS_CONTAINER: process.env.COSMOS_CONTAINER!,
};

Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});
