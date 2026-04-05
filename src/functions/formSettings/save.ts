import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { saveFormSettings } from "../../services/formSettingsService";
import { saveFormSettingsSchema } from "../../schemas/form.schema";
import { success, error } from "../../utils/response";
import { withAuth } from "../../utils/auth";

export async function saveFormSettingsHandler(
  request: HttpRequest,
  context: InvocationContext,
  user: any,
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();

    const validated = saveFormSettingsSchema.parse(body);

    const organizationId = user?.organizationId;

    if (!organizationId) {
      return error("organizationId is required", 400);
    }

    const result = await saveFormSettings(organizationId, validated, user?.id);

    return success(result, 200);
  } catch (err: any) {
    context.log("Error saving form settings:", err);

    if (err.name === "ZodError") {
      return error(err.errors[0].message, 400);
    }

    return error("Internal Server Error", 500);
  }
}

app.http("SaveFormSettings", {
  methods: ["PUT", "POST"],
  authLevel: "anonymous",
  handler: withAuth(saveFormSettingsHandler),
});
