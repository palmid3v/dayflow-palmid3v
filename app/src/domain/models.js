export const domainModels = {
  task: "A completable unit owned by To-Do.",
  event: "A scheduled calendar block owned by DayFlow.",
  reminder: "A prompt associated with a future moment or condition.",
  dailyPlan: "The planned composition of tasks, events, and reminders for a day.",
  dailyResult: "The recorded outcome of a day: completed, skipped, changed, and actual activity.",
  dailyMemory: "A human-readable record derived from plan, result, and notes."
};

export const executionStates = ["planned", "completed", "skipped", "changed"];

export function createDailyResult(plan, dateKey) {
  const blocks = plan?.blocks ?? [];
  return {
    date: dateKey,
    recordedAt: new Date().toISOString(),
    total: blocks.length,
    completed: blocks.filter((block) => block.state === "completed").length,
    skipped: blocks.filter((block) => block.state === "skipped").length,
    changed: blocks.filter((block) => block.state === "changed").length,
    planned: blocks.filter((block) => block.state === "planned").length,
    blocks: blocks.map(({ id, title, time, state }) => ({ id, title, time, state }))
  };
}

export function createDailyMemory(plan, result, note = "") {
  const total = result?.total ?? plan?.blocks?.length ?? 0;
  const completed = result?.completed ?? 0;
  const skipped = result?.skipped ?? 0;
  const changed = result?.changed ?? 0;

  const summary = total
    ? `${completed} of ${total} planned blocks completed, ${skipped} skipped, ${changed} changed.`
    : "No planned blocks were recorded.";

  return {
    date: result?.date ?? plan?.date,
    generatedAt: new Date().toISOString(),
    summary,
    note: note.trim(),
    blocks: result?.blocks ?? []
  };
}
