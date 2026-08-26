import { spawn } from "node:child_process";
import { existsSync, readFileSync, appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const CONFIG_PATH = path.join(SCRIPT_DIR, "config.json");
const LOG_DIR = path.join(SCRIPT_DIR, "logs");

mkdirSync(LOG_DIR, { recursive: true });

if (!existsSync(CONFIG_PATH)) {
  throw new Error(`Configuration introuvable : ${CONFIG_PATH}`);
}

const rawConfig = readFileSync(CONFIG_PATH, "utf8").replace(/^\uFEFF/, "");
const config = JSON.parse(rawConfig);

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  appendFileSync(
    path.join(LOG_DIR, "orchestrator.log"),
    line + "\n",
    "utf8"
  );
}

function run(command, args = []) {
  return new Promise((resolve, reject) => {
    log(`RUN ${command} ${args.join(" ")}`);

    const child = spawn(command, args, {
      cwd: config.repo || ROOT,
      shell: false,
      windowsHide: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", data => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", data => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", error => {
      log(`SPAWN ERROR ${error.message}`);
      reject(error);
    });

    child.on("close", code => {
      log(`EXIT ${command} code=${code}`);

      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        reject(
          new Error(
            `${command} exited with code ${code}\n${stderr || stdout}`
          )
        );
      }
    });
  });
}

function promptFromArgs(defaultPrompt) {
  const prompt = process.argv.slice(3).join(" ").trim();
  return prompt || defaultPrompt;
}

async function main() {
  const action = process.argv[2] || "status";

  log(`ORCHESTRATOR action=${action}`);

  if (action === "status") {
    console.log("\n=== Repère Local Orchestrator ===");
    console.log(`Repository : ${config.repo || ROOT}`);
    console.log(`Codex      : ${config.agents?.codex || "non configuré"}`);
    console.log(`Claude     : ${config.agents?.claude || "non configuré"}`);

    console.log("\nPolicy:");
    console.log(`  autoCommit = ${config.policy?.autoCommit ?? false}`);
    console.log(`  autoPush   = ${config.policy?.autoPush ?? false}`);
    console.log(`  autoMerge  = ${config.policy?.autoMerge ?? false}`);

    console.log(`\nLogs        : ${LOG_DIR}`);
    return;
  }

  if (action === "build") {
    await run(config.commands.build);
    return;
  }

  if (action === "test") {
    await run(config.commands.test);
    return;
  }

  if (action === "codex") {
    const prompt = promptFromArgs(
      "Analyse le dépôt Repère. Ne modifie aucun fichier. Identifie les 10 problèmes prioritaires pour rendre le projet viable pour un banc de test en décembre 2026."
    );

    await run(config.agents.codex, [
      "exec",
      "--sandbox",
      "workspace-write",
      prompt,
    ]);
    return;
  }

  if (action === "claude") {
    const prompt = promptFromArgs(
      "Analyse le dépôt Repère comme reviewer senior. Ne modifie aucun fichier. Identifie les risques techniques, produit, UX/UI, données et déploiement."
    );

    await run(config.agents.claude, ["-p", prompt]);
    return;
  }

  console.log(`
Usage:

  node orchestrator/orchestrator.mjs status
  node orchestrator/orchestrator.mjs build
  node orchestrator/orchestrator.mjs test
  node orchestrator/orchestrator.mjs codex
  node orchestrator/orchestrator.mjs claude

Exemples:

  node orchestrator/orchestrator.mjs codex
  node orchestrator/orchestrator.mjs claude
`);
}

main().catch(error => {
  log(`ERROR ${error.stack || error.message}`);
  process.exitCode = 1;
});
