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

export async function createTaskHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();

    const validatedData = createTaskSchema.parse(body);

    const task = await createTask(validatedData);

    return success(task, 201);
  } catch (err: any) {
    context.log("Error:", err);

    if (err instanceof AppError) {
      return error(err.message, err.statusCode);
    }

    if (err.name === "ZodError") {
      return error(err.errors.map((e) => e.message).join(", "), 400);
    }

    return error("Internal Server Error", 500);
  }
}

app.http("CreateTask", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createTaskHandler,
});
