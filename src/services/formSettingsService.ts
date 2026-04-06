import { settingsContainer } from "../database/cosmosClient";
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
    const { resource } = await settingsContainer
      .item(settingsId, organizationId)
      .read();

    if (!resource) {
      return {
        id: settingsId,
        organizationId,
        userId,
        fields: DEFAULT_FIELDS,
      };
    }

    const sanitized = sanitizeCosmosDoc(resource);
    const customFields = sanitized.fields || [];

    return {
      ...sanitized,
      fields: [...DEFAULT_FIELDS, ...customFields],
    };
  } catch (err: any) {
    if (err.code === 404 || err.statusCode === 404) {
      return {
        id: settingsId,
        organizationId,
        userId,
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

  const defaultFieldIds = DEFAULT_FIELDS.map((f) => f.id);
  const customFieldsOnly = data.fields.filter(
    (f) => !defaultFieldIds.includes(f.id),
  );

  const document = {
    id: settingsId,
    organizationId,
    userId,
    type: "form-settings",
    fields: customFieldsOnly,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await settingsContainer.items.upsert(document);

  if (!resource) return null;

  const sanitized = sanitizeCosmosDoc(resource);

  return {
    ...sanitized,
    fields: [...DEFAULT_FIELDS, ...sanitized.fields],
  };
};
