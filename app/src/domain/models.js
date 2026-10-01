export const domainModels = {
  task: "A completable unit owned by To-Do.",
  event: "A scheduled calendar block owned by DayFlow.",
  reminder: "A prompt associated with a future moment or condition.",
  dailyPlan: "The planned composition of tasks, events, and reminders for a day.",
  dailyResult: "The recorded outcome of a day: completed, skipped, changed, and actual activity.",
  dailyMemory: "A human-readable record derived from plan, result, and notes."
};

export const executionStates = ["planned", "completed", "skipped", "changed"];
