import { container } from "../database/cosmosClient";
import { SaveFormSettingsInput } from "../schemas/form.schema";
import { sanitizeCosmosDoc } from "../utils/sanitize";
import { AppError } from "../utils/AppError";

export const DEFAULT_FIELDS = [
  {
    id: "title",
    label: "Task Title",
    type: "text",
    required: true,
    columns: 16,
  },
  {
    id: "description",
    label: "Description",
    type: "text",
    required: false,
    columns: 16,
  },
  { id: "status", label: "Status", type: "text", required: true, columns: 16 },
  {
    id: "dueDate",
    label: "Due Date",
    type: "datetime",
    required: false,
    columns: 16,
  },
];
export const getFormSettings = async (
  organizationId: string,
  userId: string | undefined,
) => {
  const settingsId = `task-form-setting-${userId}`;

  try {
    const { resource } = await container
      .item(settingsId, organizationId)
      .read();

    if (!resource) {
      return {
        id: settingsId,
        organizationId,
        type: "form-settings",
        fields: DEFAULT_FIELDS,
      };
    }

    return resource ? sanitizeCosmosDoc(resource) : null;
  } catch (err: any) {
    if (err.code === 404 || err.statusCode === 404) {
      return {
        fields: DEFAULT_FIELDS,
      };
    }

    throw new AppError("Failed to fetch form settings", 500);
  }
};

export const saveFormSettings = async (
  organizationId: string,
  data: SaveFormSettingsInput,
  userId: string,
) => {
  const settingsId = `task-form-setting-${userId}`;

  const document = {
    id: settingsId,
    organizationId,
    type: "form-settings",
    fields: data.fields,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container.items.upsert(document);

  return resource ? sanitizeCosmosDoc(resource) : null;
};
