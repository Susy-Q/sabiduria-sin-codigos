import { randomBytes, scrypt } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const toolsRoot = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(toolsRoot, "..");
const dataRoot = join(appRoot, "datos");
const password = `Revisor-${randomBytes(12).toString("hex").toUpperCase()}`;
const salt = randomBytes(16);
const derived = await derive(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const passwordHash = `scrypt$16384$8$1$${salt.toString("base64")}$${Buffer.from(derived).toString("base64")}`;

await mkdir(dataRoot, { recursive: true });
await writeFile(join(dataRoot, "revisor-config.json"), `${JSON.stringify({ password_hash: passwordHash }, null, 2)}\n`, "utf8");
await writeFile(join(appRoot, "CLAVE-PRIVADA-DEL-REVISOR.txt"), [
  "ACCESO PRIVADO DEL REVISOR",
  "",
  "Dirección: http://127.0.0.1:4317/review",
  `Contraseña: ${password}`,
  "",
  "No comparta este archivo con estudiantes."
].join("\r\n"), "utf8");

console.log("Credencial privada del revisor creada correctamente.");
