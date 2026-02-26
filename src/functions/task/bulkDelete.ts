import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { bulkDeleteTasks } from "../../services/taskService";
import { bulkDeleteSchema } from "../../schemas/task.schema";
import { error } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export async function bulkDeleteHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const organizationId = request.query.get("organizationId");

    if (!organizationId) {
      return error("organizationId is required", 400);
    }

    const body = await request.json();
    const validatedIds = bulkDeleteSchema.parse(body);

    await bulkDeleteTasks(validatedIds, organizationId);

    return {
      status: 204,
    };
  } catch (err: any) {
    context.log("Error bulk deleting tasks:", err);

    if (err instanceof AppError) {
      return error(err.message, err.statusCode);
    }

    if (err.name === "ZodError") {
      return error(err.errors[0].message, 400);
    }

    return error("Internal Server Error", 500);
  }
}

app.http("BulkDeleteTasks", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: bulkDeleteHandler,
});
