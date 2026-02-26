import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getFormSettings } from "../../services/formSettingsService";
import { success, error } from "../../utils/response";

export async function getFormSettingsHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const organizationId = request.query.get("organizationId");

    if (!organizationId) {
      return error("organizationId is required", 400);
    }

    const settings = await getFormSettings(organizationId);

    if (!settings) {
      return success({ fields: [] }, 200);
    }

    return success(settings, 200);
  } catch (err) {
    context.log("Error fetching form settings:", err);
    return error("Internal Server Error", 500);
  }
}

app.http("GetFormSettings", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getFormSettingsHandler,
});
