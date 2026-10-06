import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const args = new Set(process.argv.slice(2));
const staticOnly = args.has("--static");

const stages = [
  ["UNIT", ["run", "test"]],
  ["LINT", ["run", "lint"]],
  ["BUILD", ["run", "build"]]
];

function run(label, command, commandArgs, env = {}) {
  return new Promise((resolve) => {
    console.log("\n" + "=".repeat(72));
    console.log(label);
    console.log("=".repeat(72));

    const child = spawn(command, commandArgs, {
      stdio: "inherit",
      env: { ...process.env, ...env },
      shell: isWindows
    });

    child.on("error", (error) => {
      console.error(`[FAIL] ${label}: ${error.message}`);
      resolve(false);
    });

    child.on("close", (code) => {
      const ok = code === 0;
      console.log(ok ? `[PASS] ${label}` : `[FAIL] ${label} (exit ${code})`);
      resolve(ok);
    });
  });
}

async function main() {
  console.log("DAYFLOW VALIDATION SUITE");
  console.log("Critical Value Path + Full E2E + Static Quality Gates");

  const results = [];

  for (const [label, commandArgs] of stages) {
    results.push(await run(label, npmCommand, commandArgs));
  }

  if (!results.every(Boolean)) {
    console.error("\nRESULT: BLOCKED");
    process.exit(1);
  }

  if (staticOnly) {
    console.log("\nRESULT: PASS (static validation only)");
    return;
  }

  const hasCredentials =
    Boolean(process.env.DAYFLOW_VALIDATE_EMAIL) &&
    Boolean(process.env.DAYFLOW_VALIDATE_PASSWORD);

  const hasStoredAuth = existsSync("playwright/.auth/dayflow.json");

  if (!hasCredentials && !hasStoredAuth) {
    console.error(
      "\nRESULT: BLOCKED - full validation requires DAYFLOW_VALIDATE_EMAIL and DAYFLOW_VALIDATE_PASSWORD, or a local Playwright auth state."
    );
    process.exit(1);
  }

  results.push(
    await run("CVP - Critical Value Path", npmCommand, ["run", "test:cvp"])
  );

  results.push(
    await run("E2E - Full Production Flow", npmCommand, ["run", "test:e2e"])
  );

  if (!results.every(Boolean)) {
    console.error("\nRESULT: BLOCKED");
    process.exit(1);
  }

  console.log("\nRESULT: PASS - DayFlow validation suite completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
