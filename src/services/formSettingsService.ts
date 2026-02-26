import { container } from "../database/cosmosClient";
import { SaveFormSettingsInput } from "../schemas/form.schema";
import { sanitizeCosmosDoc } from "../utils/sanitize";
import { AppError } from "../utils/AppError";

export const getFormSettings = async (organizationId: string) => {
  try {
    const { resource } = await container
      .item("task-form-settings", organizationId)
      .read();

    return resource ? sanitizeCosmosDoc(resource) : null;
  } catch (err: any) {
    if (err.code === 404 || err.statusCode === 404) {
      return null;
    }

    throw new AppError("Failed to fetch form settings", 500);
  }
};

export const saveFormSettings = async (
  organizationId: string,
  data: SaveFormSettingsInput,
) => {
  const document = {
    id: "task-form-settings",
    organizationId,
    type: "form-settings",
    fields: data.fields,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container.items.upsert(document);

  return resource ? sanitizeCosmosDoc(resource) : null;
};
