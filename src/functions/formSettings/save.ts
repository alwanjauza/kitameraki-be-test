import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { saveFormSettings } from "../../services/formSettingsService";
import { saveFormSettingsSchema } from "../../schemas/form.schema";
import { success, error } from "../../utils/response";

export async function saveFormSettingsHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();

    const validated = saveFormSettingsSchema.parse(body);

    const organizationId = request.query.get("organizationId");

    if (!organizationId) {
      return error("organizationId is required", 400);
    }

    const result = await saveFormSettings(organizationId, validated);

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
  handler: saveFormSettingsHandler,
});
