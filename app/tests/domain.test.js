import test from "node:test";
import assert from "node:assert/strict";
import { createDailyMemory, createDailyResult } from "../src/domain/models.js";

test("createDailyResult summarizes block states deterministically", () => {
  const plan = {
    date: "2026-10-05",
    blocks: [
      { id: "a", title: "One", time: "09:00", state: "completed" },
      { id: "b", title: "Two", time: "10:00", state: "planned" },
      { id: "c", title: "Three", time: "11:00", state: "skipped" },
      { id: "d", title: "Four", time: "12:00", state: "changed" }
    ]
  };
  const result = createDailyResult(plan, plan.date);
  assert.equal(result.date, "2026-10-05");
  assert.equal(result.total, 4);
  assert.equal(result.completed, 1);
  assert.equal(result.planned, 1);
  assert.equal(result.skipped, 1);
  assert.equal(result.changed, 1);
  assert.deepEqual(result.blocks[0], { id: "a", title: "One", time: "09:00", state: "completed" });
});

test("createDailyMemory uses the recorded result and preserves the note", () => {
  const result = { date: "2026-10-05", total: 2, completed: 1, skipped: 1, changed: 0, blocks: [] };
  const memory = createDailyMemory({ blocks: [] }, result, "  Good focus today.  ");
  assert.equal(memory.date, "2026-10-05");
  assert.equal(memory.summary, "1 of 2 planned blocks completed, 1 skipped, 0 changed.");
  assert.equal(memory.note, "Good focus today.");
});
