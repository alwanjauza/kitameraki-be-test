import { container } from "../database/cosmosClient";
import { sanitizeCosmosDoc } from "../utils/sanitize";

export interface UserPayload {
  oid: string;
  tid: string;
  name?: string;
  preferred_username?: string;
}

export const getOrCreateUser = async (payload: UserPayload) => {
  try {
    const { resource } = await container.item(payload.oid, payload.tid).read();

    if (resource) {
      return sanitizeCosmosDoc(resource);
    }
  } catch (error) {
    if (error.code !== 404 && error.statusCode !== 404) {
      throw error;
    }
  }

  const newUser = {
    id: payload.oid,
    organizationId: payload.tid,
    type: "user",
    name: payload.name || "",
    email: payload.preferred_username || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container.items.create(newUser);
  return resource ? sanitizeCosmosDoc(resource) : null;
};
