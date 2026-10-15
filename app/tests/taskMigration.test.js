import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTaskDocument,
  normalizeTaskRecord,
  parseLegacyTaskList,
  setTaskCompletion
} from "../src/features/tasks/taskModel.js";

test("preserves IDs stored by the legacy To-Do serializer", () => {
  const task = normalizeTaskDocument("task%2Flegacy", {
    id: "task/legacy",
    title: "Legacy task",
    completed: false
  });
  assert.equal(task.id, "task/legacy");
});

test("recovers a path-encoded ID when an older record has no ID field", () => {
  const task = normalizeTaskDocument("task%2Flegacy", {
    title: "Recovered task",
    done: true
  });
  assert.equal(task.id, "task/legacy");
  assert.equal(task.completed, true);
});

test("does not trust an ID that points somewhere other than its document path", () => {
  const task = normalizeTaskDocument("canonical-id", {
    id: "different-id",
    title: "Mismatched record"
  });
  assert.equal(task.id, "canonical-id");
});

test("normalizes legacy aliases and preserves task metadata", () => {
  const task = normalizeTaskRecord({
    id: "task-1",
    name: "  Review  ",
    done: true,
    priority: "high",
    tags: ["work", "release"]
  });
  assert.equal(task.title, "Review");
  assert.equal(task.completed, true);
  assert.equal(task.status, "completed");
  assert.equal(task.priority, "high");
  assert.deepEqual(task.tags, ["work", "release"]);
});

test("refuses to silently discard malformed legacy records", () => {
  assert.throws(
    () => parseLegacyTaskList(JSON.stringify([
      { id: "ok", title: "Valid task" },
      { title: "Missing ID" }
    ])),
    /without a valid ID or title/
  );
  assert.throws(
    () => parseLegacyTaskList(JSON.stringify([
      { id: "duplicate", title: "First" },
      { id: "duplicate", title: "Second" }
    ])),
    /duplicate task IDs/
  );
});

test("accepts an empty legacy task list", () => {
  assert.deepEqual(parseLegacyTaskList("[]"), []);
});


test("task completion transition keeps completed and status fields consistent", () => {
  const task = normalizeTaskRecord({ id: "task-1", title: "Review release" });
  const completed = setTaskCompletion(task, true, "2026-10-15T12:00:00.000Z");
  assert.equal(completed.completed, true);
  assert.equal(completed.status, "completed");
  assert.equal(completed.updatedAt, "2026-10-15T12:00:00.000Z");

  const reopened = setTaskCompletion(completed, false, "2026-10-15T12:05:00.000Z");
  assert.equal(reopened.completed, false);
  assert.equal(reopened.status, "active");
  assert.equal(reopened.id, task.id);
  assert.equal(reopened.title, task.title);
});
