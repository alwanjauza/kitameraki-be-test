import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { deleteTask } from "../../services/taskService";
import { error } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export async function deleteTaskHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const taskId = request.query.get("id");
    const organizationId = request.query.get("organizationId");

    if (!taskId || !organizationId) {
      return error("id and organizationId are required", 400);
    }

    await deleteTask(taskId, organizationId);

    return {
      status: 204,
    };
  } catch (err: any) {
    context.log("Error deleting task:", err);

    if (err instanceof AppError) {
      return error(err.message, err.statusCode);
    }

    return error("Internal Server Error", 500);
  }
}

app.http("DeleteTask", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: deleteTaskHandler,
});
