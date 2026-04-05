import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { updateTask } from "../../services/taskService";
import { updateTaskSchema } from "../../schemas/task.schema";
import { success, error } from "../../utils/response";
import { AppError } from "../../utils/AppError";
import { withAuth } from "../../utils/auth";

export async function updateTaskHandler(
  request: HttpRequest,
  context: InvocationContext,
  user: any,
): Promise<HttpResponseInit> {
  try {
    const taskId = request.query.get("id");
    const partitionKey = user?.organizationId;

    if (!taskId || !partitionKey) {
      return error(
        "Missing required query parameters: id or organizationId",
        400,
      );
    }

    const body = await request.json();

    const validatedData = updateTaskSchema.parse(body);

    const updatedTask = await updateTask(taskId, partitionKey, validatedData);

    return success(updatedTask, 200);
  } catch (err: any) {
    context.log("Error UpdateTask:", err.message || "Unknown error occurred");

    if (err instanceof AppError) {
      return error(err.message, err.statusCode);
    }

    if (err.name === "ZodError") {
      return error(err.errors[0].message, 400);
    }

    return error("Internal Server Error", 500);
  }
}

app.http("UpdateTask", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  handler: withAuth(updateTaskHandler),
});
