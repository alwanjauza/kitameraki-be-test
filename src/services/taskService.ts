import { PatchOperation } from "@azure/cosmos";
import { container } from "../database/cosmosClient";
import { v4 as uuidv4 } from "uuid";
import { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schema";
import { sanitizeCosmosDoc, sanitizeCosmosDocs } from "../utils/sanitize";
import { AppError } from "../utils/AppError";

export interface GetTasksParams {
  organizationId: string;
  userId: string;
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export const getTasks = async ({
  organizationId,
  page = 1,
  pageSize = 10,
  status,
  search,
  userId,
}: GetTasksParams) => {
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [
    "c.organizationId = @organizationId",
    "c.type = 'task'",
    "c.userId = @userId",
  ];

  const parameters: any[] = [
    { name: "@organizationId", value: organizationId },
    { name: "@userId", value: userId },
  ];

  if (status) {
    conditions.push("c.status = @status");
    parameters.push({ name: "@status", value: status });
  }

  if (search) {
    conditions.push("CONTAINS(LOWER(c.title), LOWER(@search))");
    parameters.push({ name: "@search", value: search });
  }

  const whereClause = conditions.join(" AND ");

  const querySpec = {
    query: `
      SELECT * FROM c
      WHERE ${whereClause}
      ORDER BY c.createdAt DESC
      OFFSET @offset LIMIT @limit
    `,
    parameters: [
      ...parameters,
      { name: "@offset", value: offset },
      { name: "@limit", value: pageSize },
    ],
  };

  const { resources } = await container.items.query(querySpec).fetchAll();

  const countQuery = {
    query: `SELECT VALUE COUNT(1) FROM c WHERE ${whereClause}`,
    parameters,
  };

  const { resources: countResources } = await container.items
    .query(countQuery)
    .fetchAll();
  const total = countResources[0] ?? 0;

  return {
    data: sanitizeCosmosDocs(resources),
    total,
    page,
    pageSize,
  };
};

export const getTaskById = async (taskId: string, partitionKey: string) => {
  try {
    const { resource } = await container.item(taskId, partitionKey).read();

    if (!resource) {
      throw new AppError("Task not found", 404);
    }

    return sanitizeCosmosDoc(resource);
  } catch (err: any) {
    if (err.code === 404 || err.statusCode === 404) {
      throw new AppError("Task not found", 404);
    }

    throw new AppError("Failed to fetch task", 500);
  }
};

export const createTask = async (data: CreateTaskInput, userId: string) => {
  const now = new Date().toISOString();

  const task = {
    id: uuidv4(),
    ...data,
    userId,
    type: "task",
    createdAt: now,
    updatedAt: now,
  };

  const { resource } = await container.items.create(task);
  return resource ? sanitizeCosmosDoc(resource) : null;
};

export const updateTask = async (
  taskId: string,
  partitionKey: string,
  data: UpdateTaskInput,
) => {
  try {
    const restrictedKeys = ["id", "organizationId", "createdAt", "updatedAt"];

    const validEntries = Object.entries(data).filter(
      ([key, value]) =>
        value !== undefined &&
        !restrictedKeys.includes(key) &&
        !key.startsWith("_"),
    );

    if (validEntries.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    const patchOperations: PatchOperation[] = validEntries.map(
      ([key, value]) => ({
        op: "set",
        path: `/${key}`,
        value,
      }),
    );

    patchOperations.push({
      op: "set",
      path: "/updatedAt",
      value: new Date().toISOString(),
    });

    const { resource } = await container
      .item(taskId, partitionKey)
      .patch(patchOperations);

    if (!resource) {
      throw new AppError("Task not found", 404);
    }

    return sanitizeCosmosDoc(resource);
  } catch (err: any) {
    if (err.code === 404 || err.statusCode === 404) {
      throw new AppError("Task not found", 404);
    }

    throw err;
  }
};

export const deleteTask = async (taskId: string, partitionKey: string) => {
  try {
    await container.item(taskId, partitionKey).delete();
  } catch (err: any) {
    if (err.code === 404 || err.statusCode === 404) {
      throw new AppError("Task not found", 404);
    }

    throw new AppError("Failed to fetch task", 500);
  }
};

export const bulkDeleteTasks = async (
  taskIds: string[],
  partitionKey: string,
) => {
  try {
    const deletePromises = taskIds.map((id) =>
      container.item(id, partitionKey).delete(),
    );

    await Promise.all(deletePromises);
  } catch (err: any) {
    if (err.code === 404 || err.statusCode === 404) {
      throw new AppError("Task not found", 404);
    }

    throw new AppError("Failed to fetch task", 500);
  }
};
