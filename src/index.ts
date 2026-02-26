import { app } from "@azure/functions";

import "./functions/task/create";
import "./functions/task/update";
import "./functions/task/delete";
import "./functions/task/getAll";
import "./functions/task/getOne";
import "./functions/task/bulkDelete";

import "./functions/formSettings/get";
import "./functions/formSettings/save";

app.setup({
  enableHttpStream: true,
});
