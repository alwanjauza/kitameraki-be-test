import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getFormSettings } from "../../services/formSettingsService";
import { success, error } from "../../utils/response";
import { withAuth } from "../../utils/auth";

export async function getFormSettingsHandler(
  request: HttpRequest,
  context: InvocationContext,
  user: any,
): Promise<HttpResponseInit> {
  try {
    const organizationId = user?.organizationId;

    if (!organizationId) {
      return error("organizationId is required", 400);
    }

    const settings = await getFormSettings(organizationId, user?.id);

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
  handler: withAuth(getFormSettingsHandler),
});
