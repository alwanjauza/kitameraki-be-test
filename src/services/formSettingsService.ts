import { settingsContainer } from "../database/cosmosClient";
import { SaveFormSettingsInput } from "../schemas/form.schema";
import { sanitizeCosmosDoc } from "../utils/sanitize";
import { AppError } from "../utils/AppError";
import { v4 as uuidv4 } from "uuid";

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

export const getFormSettings = async (organizationId: string) => {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.organizationId = @orgId",
      parameters: [{ name: "@orgId", value: organizationId }],
    };

    const { resources } = await settingsContainer.items
      .query(querySpec)
      .fetchAll();
    const resource = resources[0];

    if (!resource) {
      return {
        organizationId,
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
    throw new AppError("Failed to fetch form settings", 500);
  }
};

export const saveFormSettings = async (
  organizationId: string,
  data: SaveFormSettingsInput,
  userId: string,
) => {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.organizationId = @orgId",
    parameters: [{ name: "@orgId", value: organizationId }],
  };
  const { resources } = await settingsContainer.items
    .query(querySpec)
    .fetchAll();
  const existingDoc = resources[0];

  const defaultFieldIds = DEFAULT_FIELDS.map((f) => f.id);
  const customFieldsOnly = data.fields.filter(
    (f) => !defaultFieldIds.includes(f.id),
  );

  const document = {
    id: existingDoc ? existingDoc.id : uuidv4(),
    organizationId,
    type: "form-settings",
    fields: customFieldsOnly,
    lastUpdatedBy: userId,
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
