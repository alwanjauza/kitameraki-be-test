import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getTaskById } from "../../services/taskService";
import { success, error } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export async function getTaskHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const taskId = request.query.get("id");
    const organizationId = request.query.get("organizationId");

    if (!taskId || !organizationId) {
      return error("id and organizationId are required", 400);
    }

    const task = await getTaskById(taskId, organizationId);

    return success(task, 200);
  } catch (err: any) {
    context.log("Error:", err);

    if (err instanceof AppError) {
      return error(err.message, err.statusCode);
    }

    if (err.name === "ZodError") {
      return error(err.errors[0].message, 400);
    }

    return error("Internal Server Error", 500);
  }
}

app.http("GetTask", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getTaskHandler,
});
