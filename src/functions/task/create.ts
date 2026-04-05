import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { createTask } from "../../services/taskService";
import { createTaskSchema } from "../../schemas/task.schema";
import { success, error } from "../../utils/response";
import { AppError } from "../../utils/AppError";
import { withAuth } from "../../utils/auth";

export async function createTaskHandler(
  request: HttpRequest,
  context: InvocationContext,
  user: any,
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();

    const validatedData = createTaskSchema.parse({
      ...(body as object),
      organizationId: user?.organizationId,
    });

    const task = await createTask(validatedData, user?.id);

    return success(task, 201);
  } catch (err: any) {
    context.log(`Error CreateTask: ${err.message || err}`);

    if (err instanceof AppError) {
      return error(err.message, err.statusCode);
    }

    if (err.name === "ZodError") {
      const detail = err.errors.map((e: any) => e.message).join(", ");
      return error(detail, 400);
    }

    return error("Internal Server Error", 500);
  }
}

app.http("CreateTask", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: withAuth(createTaskHandler),
});
