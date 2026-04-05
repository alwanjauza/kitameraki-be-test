import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getTasks } from "../../services/taskService";
import { success, error } from "../../utils/response";
import { withAuth } from "../../utils/auth";

export async function getTasksHandler(
  request: HttpRequest,
  context: InvocationContext,
  user: any,
): Promise<HttpResponseInit> {
  try {
    const organizationId = user?.organizationId;

    if (!organizationId) {
      return error("organizationId is required", 400);
    }

    const page = Number(request.query.get("page") ?? 1);
    const pageSize = Number(request.query.get("pageSize") ?? 10);
    const status = request.query.get("status") ?? undefined;
    const search = request.query.get("search") ?? undefined;

    const result = await getTasks({
      organizationId,
      page,
      pageSize,
      status,
      search,
      userId: user?.id,
    });

    return success(result, 200);
  } catch (err) {
    context.log("Error fetching tasks:", err);
    return error("Internal Server Error", 500);
  }
}

app.http("GetTasks", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: withAuth(getTasksHandler),
});
