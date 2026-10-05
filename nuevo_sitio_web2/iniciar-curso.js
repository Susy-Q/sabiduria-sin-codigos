import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const url = "http://127.0.0.1:4317";

function openBrowser() {
  const browser = spawn("cmd.exe", ["/c", "start", "", url], {
    detached: true,
    stdio: "ignore",
    windowsHide: true
  });
  browser.unref();
}

async function isReady() {
  try {
    const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch { return false; }
}

if (await isReady()) {
  openBrowser();
  process.exit(0);
}

console.log("Iniciando Sabiduría Sin Códigos...");
console.log("Mantenga esta ventana abierta mientras utiliza el curso.");
const server = spawn(process.execPath, ["--no-warnings", join(root, "servidor-local.js")], {
  cwd: root,
  stdio: "inherit"
});

let ready = false;
for (let attempt = 0; attempt < 40; attempt += 1) {
  await new Promise(resolve => setTimeout(resolve, 400));
  if (server.exitCode !== null) break;
  if (await isReady()) { ready = true; break; }
}

if (!ready) {
  console.error("No se pudo iniciar el sistema local.");
  server.kill();
  process.exit(1);
}

console.log(`Sistema listo: ${url}`);
openBrowser();
process.on("SIGINT", () => server.kill("SIGINT"));
process.on("SIGTERM", () => server.kill("SIGTERM"));
server.on("exit", code => process.exit(code ?? 0));
