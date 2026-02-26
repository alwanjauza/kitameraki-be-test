export function sanitizeCosmosDoc<T extends Record<string, any>>(doc: T): T {
  const { _rid, _self, _etag, _attachments, _ts, ...clean } = doc;
  return clean as T;
}

export function sanitizeCosmosDocs<T extends Record<string, any>>(
  docs: T[],
): T[] {
  return docs.map(sanitizeCosmosDoc);
}
