import { usersContainer } from "../database/cosmosClient";
import { sanitizeCosmosDoc } from "../utils/sanitize";

export interface UserPayload {
  oid: string;
  tid: string;
  name?: string;
  preferred_username?: string;
  roles?: string[];
}

export const getOrCreateUser = async (payload: UserPayload) => {
  const isAdmin = payload.roles?.includes("TenantAdmin");
  const currentRole = isAdmin ? "admin" : "member";

  try {
    const { resource } = await usersContainer
      .item(payload.oid, payload.tid)
      .read();

    if (resource) {
      if (resource.role !== currentRole) {
        resource.role = currentRole;
        await usersContainer.items.upsert(resource);
      }
      return sanitizeCosmosDoc(resource);
    }
  } catch (error: any) {
    if (error.code !== 404 && error.statusCode !== 404) {
      throw error;
    }
  }

  const newUser = {
    id: payload.oid,
    organizationId: payload.tid,
    name: payload.name || "",
    email: payload.preferred_username || "",
    role: currentRole,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await usersContainer.items.create(newUser);
  return resource ? sanitizeCosmosDoc(resource) : null;
};
