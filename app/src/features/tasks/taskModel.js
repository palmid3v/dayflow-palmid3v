function decodeDocumentId(documentId) {
  const raw = String(documentId ?? "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function normalizeTaskRecord(task, fallbackId = "") {
  if (!task || typeof task !== "object" || Array.isArray(task)) return null;

  const id = String(task.id ?? fallbackId ?? "").trim();
  const title = String(task.title ?? task.name ?? "").trim();
  if (!id || !title) return null;

  const createdAt = String(task.createdAt ?? new Date().toISOString());
  const completed = Boolean(task.completed ?? task.done);

  return {
    id,
    title,
    description: String(task.description ?? ""),
    completed,
    status: task.status ?? (completed ? "completed" : "active"),
    priority: task.priority ?? "normal",
    dueDate: task.dueDate ? String(task.dueDate) : "",
    scheduledTime: task.scheduledTime ? String(task.scheduledTime) : "",
    category: String(task.category ?? ""),
    tags: Array.isArray(task.tags) ? task.tags.map(String) : [],
    createdAt,
    updatedAt: String(task.updatedAt ?? createdAt)
  };
}

/**
 * Keep the task's canonical ID consistent with its Firestore document path.
 * Existing To-Do writes URL-encode IDs for use as document IDs.
 */
export function normalizeTaskDocument(documentId, data) {
  const docId = String(documentId ?? "");
  const decodedId = decodeDocumentId(docId);
  const storedId = String(data?.id ?? "").trim();

  let id = decodedId;
  if (storedId) {
    try {
      if (encodeURIComponent(storedId) === docId) id = storedId;
    } catch {
      // If a malformed value cannot be encoded, use the path-derived ID.
    }
  }

  return normalizeTaskRecord({ ...data, id }, decodedId);
}

/**
 * Parse legacy localStorage records without silently dropping invalid records.
 * Callers can leave the original JSON untouched and ask for manual recovery.
 */
export function parseLegacyTaskList(raw) {
  const parsed = JSON.parse(raw ?? "[]");
  if (!Array.isArray(parsed)) {
    throw new Error("Legacy task data must be an array.");
  }

  const normalized = parsed.map((task) => normalizeTaskRecord(task));
  if (normalized.some((task) => task === null)) {
    throw new Error("Legacy task data contains a record without a valid ID or title.");
  }

  const ids = new Set();
  for (const task of normalized) {
    if (ids.has(task.id)) {
      throw new Error("Legacy task data contains duplicate task IDs.");
    }
    ids.add(task.id);
  }

  return normalized;
}
