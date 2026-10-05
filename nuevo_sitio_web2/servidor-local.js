import http from "node:http";
import { readFile, mkdir, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const scrypt = promisify(scryptCallback);
const appRoot = dirname(fileURLToPath(import.meta.url));
const dataRoot = process.env.CURSO_DATA_DIR ? resolve(process.env.CURSO_DATA_DIR) : join(appRoot, "datos");
const databasePath = join(dataRoot, "curso.db");
const contactDataRoot = join(dataRoot, "contacto");
const registrationDataRoot = join(dataRoot, "registros");
const reviewerConfigPath = join(dataRoot, "revisor-config.json");
const host = "127.0.0.1";
const port = Number(process.env.CURSO_PORT || 4317);
const sessionHours = 12;

await mkdir(dataRoot, { recursive: true });
await mkdir(contactDataRoot, { recursive: true });
await mkdir(registrationDataRoot, { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email ON students(email);
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new'
  );
  CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
  CREATE TABLE IF NOT EXISTS course_progress (
    student_id INTEGER PRIMARY KEY,
    progress_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );
  PRAGMA optimize;
`);

const studentColumns = new Set(db.prepare("PRAGMA table_info(students)").all().map(column => column.name));
if (!studentColumns.has("full_name")) db.exec("ALTER TABLE students ADD COLUMN full_name TEXT");
if (!studentColumns.has("phone")) db.exec("ALTER TABLE students ADD COLUMN phone TEXT");

const attempts = new Map();
const reviewerSessions = new Map();
let reviewerConfig = null;
try { reviewerConfig = JSON.parse(await readFile(reviewerConfigPath, "utf8")); } catch {}

async function saveReadableRecord(folder, prefix, id, data) {
  const fileName = `${prefix}-${String(id).padStart(6, "0")}.json`;
  await writeFile(join(folder, fileName), `${JSON.stringify(data, null, 2)}\n`, { encoding: "utf8", flag: "w" });
}
const mimeTypes = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".jfif": "image/jpeg",
  ".mp4": "video/mp4", ".webm": "video/webm", ".ogg": "video/ogg"
};

function securityHeaders(extra = {}) {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self' data: blob:; img-src 'self' data:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'",
    ...extra
  };
}

function send(res, status, body, type = "text/plain; charset=utf-8", extra = {}) {
  res.writeHead(status, securityHeaders({ "Content-Type": type, "Content-Length": Buffer.byteLength(body), ...extra }));
  res.end(body);
}

function json(res, status, value, extra = {}) {
  send(res, status, JSON.stringify(value), "application/json; charset=utf-8", { "Cache-Control": "no-store", ...extra });
}

function redirect(res, location) {
  res.writeHead(303, securityHeaders({ Location: location, "Cache-Control": "no-store" }));
  res.end();
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map(part => {
    const index = part.indexOf("=");
    return [decodeURIComponent(part.slice(0, index).trim()), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

function currentStudent(req) {
  const token = parseCookies(req).course_session;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const now = Date.now();
  const row = db.prepare(`
    SELECT students.id, students.email, students.full_name
    FROM sessions JOIN students ON students.id = sessions.student_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash(token), now);
  return row || null;
}

function currentReviewer(req) {
  const token = parseCookies(req).reviewer_session;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const expiresAt = reviewerSessions.get(tokenHash(token));
  if (!expiresAt || expiresAt <= Date.now()) return false;
  return true;
}

async function passwordHash(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$16384$8$1$${salt.toString("base64")}$${Buffer.from(derived).toString("base64")}`;
}

async function passwordMatches(password, encoded) {
  try {
    const [algorithm, n, r, p, salt64, hash64] = encoded.split("$");
    if (algorithm !== "scrypt") return false;
    const expected = Buffer.from(hash64, "base64");
    const actual = Buffer.from(await scrypt(password, Buffer.from(salt64, "base64"), expected.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024
    }));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 262_144) throw new Error("request_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function validOrigin(req) {
  const origin = req.headers.origin;
  return !origin || origin === `http://${host}:${port}` || origin === `http://localhost:${port}`;
}

function rateLimited(key) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const record = attempts.get(key);
  if (!record || now - record.started > windowMs) {
    attempts.set(key, { count: 1, started: now });
    return false;
  }
  record.count += 1;
  return record.count > 10;
}

function clearAttempts(key) { attempts.delete(key); }

function sessionCookie(token) {
  const seconds = sessionHours * 60 * 60;
  return `course_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}`;
}

function reviewerCookie(token) {
  const seconds = sessionHours * 60 * 60;
  return `reviewer_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}`;
}

function createSession(studentId) {
  const rawToken = randomBytes(32).toString("hex");
  const now = Date.now();
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  db.prepare("INSERT INTO sessions(student_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(studentId, tokenHash(rawToken), now + sessionHours * 60 * 60 * 1000, now);
  return rawToken;
}

function injectLogout(html, email, reviewer = false, fullName = "") {
  const safeEmail = email.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
  const control = `<form method="post" action="/api/logout" style="position:fixed;z-index:9999;right:18px;bottom:18px;display:flex;align-items:center;gap:10px;padding:9px 10px 9px 14px;border:1px solid #cfdfdf;border-radius:14px;background:#fff;box-shadow:0 12px 35px rgba(24,48,68,.18);font:13px 'Segoe UI',Arial,sans-serif;color:#183044"><span>${safeEmail}</span><button type="submit" style="padding:8px 11px;border:0;border-radius:9px;background:#173f56;color:#fff;font:inherit;font-weight:700;cursor:pointer">Sign out / Cerrar sesión</button></form>`;
  const reviewFlag = reviewer ? "window.__COURSE_REVIEW__=true;" : "";
  const identityFlag = `<script>window.__COURSE_USER__=${JSON.stringify(email)};window.__COURSE_STUDENT_NAME__=${JSON.stringify(fullName)};${reviewFlag}</script>`;
  return html.replace("<body>", `<body>${identityFlag}`);
}

async function serveCourse(req, res, pathname, identity, reviewer = false, fullName = "") {
  let relative = pathname.replace(/^\/course\/?/, "");
  if (!relative || relative === "index.html") relative = "independencia-digital-ia.html";
  const decoded = decodeURIComponent(relative);
  if (/^(datos|herramientas-privadas)([\\/]|$)/i.test(decoded) || /^acceso-revisor\./i.test(decoded) || /^CLAVE-PRIVADA/i.test(decoded)) return send(res, 403, "Acceso denegado");
  const filePath = resolve(appRoot, normalize(decoded));
  if (filePath !== appRoot && !filePath.startsWith(appRoot + "\\") && !filePath.startsWith(appRoot + "/")) {
    return send(res, 403, "Acceso denegado");
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not_file");
    const extension = extname(filePath).toLowerCase();
    if (extension === ".html") {
      const html = injectLogout(await readFile(filePath, "utf8"), identity, reviewer, fullName);
      return send(res, 200, html, mimeTypes[extension], { "Cache-Control": "no-store" });
    }
    const type = mimeTypes[extension];
    if (!type) return send(res, 415, "Tipo de archivo no permitido");
    res.writeHead(200, securityHeaders({ "Content-Type": type, "Content-Length": info.size, "Cache-Control": "private, max-age=3600" }));
    createReadStream(filePath).pipe(res);
  } catch {
    send(res, 404, "Archivo no encontrado");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);
    const pathname = url.pathname;
    const student = currentStudent(req);
    const reviewer = currentReviewer(req);

    if (req.method === "GET" && pathname === "/health") return json(res, 200, { ok: true });
    if (req.method === "GET" && pathname === "/api/progress") {
      if (!student) return json(res, 401, { error: "Inicie sesión para recuperar el progreso." });
      const record = db.prepare("SELECT progress_json, updated_at FROM course_progress WHERE student_id = ?").get(student.id);
      return json(res, 200, record ? { progress: JSON.parse(record.progress_json), updatedAt: record.updated_at } : { progress: {}, updatedAt: 0 });
    }
    if (req.method === "PUT" && pathname === "/api/progress") {
      if (!student) return json(res, 401, { error: "Inicie sesión para guardar el progreso." });
      if (!validOrigin(req)) return json(res, 403, { error: "Solicitud no válida." });
      const body = await readJson(req), progress = body?.progress;
      if (!progress || typeof progress !== "object" || Array.isArray(progress)) return json(res, 400, { error: "Progreso no válido." });
      const entries = Object.entries(progress);
      if (entries.length > 300 || entries.some(([key, value]) => !/^id-(v2|course-language)/.test(key) || typeof value !== "string" || value.length > 12_000)) return json(res, 400, { error: "Progreso no válido." });
      const updatedAt = Date.now(), serialized = JSON.stringify(progress);
      db.prepare(`INSERT INTO course_progress(student_id, progress_json, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at`)
        .run(student.id, serialized, updatedAt);
      return json(res, 200, { ok: true, updatedAt });
    }
    if (req.method === "GET" && pathname === "/review") {
      if (reviewer) return redirect(res, "/course/");
      return send(res, 200, await readFile(join(appRoot, "acceso-revisor.html"), "utf8"), "text/html; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/acceso-revisor.js") {
      return send(res, 200, await readFile(join(appRoot, "acceso-revisor.js"), "utf8"), "text/javascript; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/") {
      if (student) return redirect(res, "/course/");
      return send(res, 200, await readFile(join(appRoot, "index.html"), "utf8"), "text/html; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/index.js") {
      return send(res, 200, await readFile(join(appRoot, "index.js"), "utf8"), "text/javascript; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/course-outline-data.js") {
      return send(res, 200, await readFile(join(appRoot, "course-outline-data.js"), "utf8"), "text/javascript; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/registro-local.js") {
      return send(res, 200, await readFile(join(appRoot, "registro-local.js"), "utf8"), "text/javascript; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/acceso-local.js") {
      return send(res, 200, await readFile(join(appRoot, "acceso-local.js"), "utf8"), "text/javascript; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && (pathname === "/login" || pathname === "/register" || pathname === "/contact" || pathname === "/contacto.html")) {
      if (student && pathname === "/login") return redirect(res, "/course/");
      const file = pathname === "/register" ? "registro.html" : (pathname === "/contact" || pathname === "/contacto.html") ? "contacto.html" : "acceso.html";
      return send(res, 200, await readFile(join(appRoot, file), "utf8"), "text/html; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/acceso.css") {
      return send(res, 200, await readFile(join(appRoot, "acceso.css"), "utf8"), "text/css; charset=utf-8");
    }
    const publicStyles = new Set(["accesibilidad.css", "curso-gratuito.css", "acceso-mejorado.css", "registro-mejorado.css", "responsive.css", "pie-sitio.css", "encabezado-mejorado.css"]);
    if (req.method === "GET" && publicStyles.has(pathname.slice(1))) {
      return send(res, 200, await readFile(join(appRoot, pathname.slice(1)), "utf8"), "text/css; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/pie-sitio.js") {
      return send(res, 200, await readFile(join(appRoot, "pie-sitio.js"), "utf8"), "text/javascript; charset=utf-8", { "Cache-Control": "no-store" });
    }
    if (req.method === "GET" && pathname === "/logo-codigo-tecnologia.png") {
      return send(res, 200, await readFile(join(appRoot, "logo-codigo-tecnologia.png")), "image/png", { "Cache-Control": "public, max-age=3600" });
    }
    if (req.method === "POST" && pathname === "/api/register") {
      if (!validOrigin(req)) return json(res, 403, { error: "Solicitud no válida." });
      const body = await readJson(req);
      const fullName = String(body.fullName || "").trim().replace(/\s+/g, " ");
      const phone = String(body.phone || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const key = `${req.socket.remoteAddress}:${email}`;
      if (rateLimited(key)) return json(res, 429, { error: "Demasiados intentos. Espere 15 minutos." });
      if (fullName.length < 2 || fullName.length > 100) return json(res, 400, { error: "Ingrese el nombre completo." });
      if (phone.length < 7 || phone.length > 30 || !/^[0-9+()\-\s]+$/.test(phone)) return json(res, 400, { error: "Ingrese un número de teléfono válido." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json(res, 400, { error: "Ingrese una dirección de correo válida." });
      if (password.length < 10 || password.length > 200) return json(res, 400, { error: "La contraseña debe tener entre 10 y 200 caracteres." });
      if (db.prepare("SELECT id FROM students WHERE email = ?").get(email)) return json(res, 409, { error: "Ya existe una cuenta con ese correo." });
      const result = db.prepare("INSERT INTO students(email, password_hash, created_at, full_name, phone) VALUES (?, ?, ?, ?, ?)")
        .run(email, await passwordHash(password), Date.now(), fullName, phone);
      const studentId = Number(result.lastInsertRowid);
      await saveReadableRecord(registrationDataRoot, "estudiante", studentId, {
        id: studentId,
        nombreCompleto: fullName,
        telefono: phone,
        correoElectronico: email,
        fechaRegistro: new Date().toISOString(),
        notaSeguridad: "La contraseña no se incluye en este archivo. Se conserva protegida únicamente en la base de datos local."
      });
      const token = createSession(studentId);
      clearAttempts(key);
      return json(res, 201, { ok: true, redirect: "/course/" }, { "Set-Cookie": sessionCookie(token) });
    }
    if (req.method === "POST" && pathname === "/api/contact") {
      if (!validOrigin(req)) return json(res, 403, { error: "Solicitud no válida." });
      const body = await readJson(req);
      const fullName = String(body.fullName || "").trim().replace(/\s+/g, " ");
      const email = String(body.email || "").trim().toLowerCase();
      const subject = String(body.subject || "").trim().replace(/\s+/g, " ");
      const message = String(body.message || "").trim();
      const key = `${req.socket.remoteAddress}:contact:${email}`;
      if (rateLimited(key)) return json(res, 429, { error: "Demasiados mensajes. Espere 15 minutos." });
      if (fullName.length < 2 || fullName.length > 100) return json(res, 400, { error: "Ingrese su nombre completo." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json(res, 400, { error: "Ingrese una dirección de correo válida." });
      if (subject.length < 3 || subject.length > 150) return json(res, 400, { error: "Ingrese un asunto válido." });
      if (message.length < 10 || message.length > 5000) return json(res, 400, { error: "El mensaje debe tener entre 10 y 5000 caracteres." });
      const contactResult = db.prepare("INSERT INTO contact_messages(full_name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)")
        .run(fullName, email, subject, message, Date.now());
      const contactId = Number(contactResult.lastInsertRowid);
      await saveReadableRecord(contactDataRoot, "mensaje", contactId, {
        id: contactId,
        nombreCompleto: fullName,
        correoElectronico: email,
        asunto: subject,
        mensaje: message,
        fechaRecepcion: new Date().toISOString(),
        estado: "nuevo"
      });
      clearAttempts(key);
      return json(res, 201, { ok: true, message: "Su mensaje fue guardado correctamente. La meta de respuesta es de dos dÃ­as hÃ¡biles." });
    }
    if (req.method === "POST" && pathname === "/api/login") {
      if (!validOrigin(req)) return json(res, 403, { error: "Solicitud no válida." });
      const body = await readJson(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const key = `${req.socket.remoteAddress}:${email}`;
      if (rateLimited(key)) return json(res, 429, { error: "Demasiados intentos. Espere 15 minutos." });
      const row = db.prepare("SELECT id, password_hash FROM students WHERE email = ?").get(email);
      if (!row || !(await passwordMatches(password, row.password_hash))) return json(res, 401, { error: "Correo o contraseña incorrectos." });
      const token = createSession(row.id);
      clearAttempts(key);
      return json(res, 200, { ok: true, redirect: "/course/" }, { "Set-Cookie": sessionCookie(token) });
    }
    if (req.method === "POST" && pathname === "/api/reviewer-login") {
      if (!validOrigin(req)) return json(res, 403, { error: "Solicitud no válida." });
      if (!reviewerConfig?.password_hash) return json(res, 503, { error: "El acceso del revisor no está configurado." });
      const body = await readJson(req);
      const password = String(body.password || "");
      const key = `${req.socket.remoteAddress}:reviewer`;
      if (rateLimited(key)) return json(res, 429, { error: "Demasiados intentos. Espere 15 minutos." });
      if (!(await passwordMatches(password, reviewerConfig.password_hash))) return json(res, 401, { error: "Contraseña del revisor incorrecta." });
      const rawToken = randomBytes(32).toString("hex");
      reviewerSessions.set(tokenHash(rawToken), Date.now() + sessionHours * 60 * 60 * 1000);
      clearAttempts(key);
      return json(res, 200, { ok: true, redirect: "/course/" }, { "Set-Cookie": reviewerCookie(rawToken) });
    }
    if (req.method === "POST" && pathname === "/api/logout") {
      if (!validOrigin(req)) return json(res, 403, { error: "Solicitud no válida." });
      const token = parseCookies(req).course_session;
      if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash(token));
      const cookies = ["course_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0", "reviewer_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"];
      res.writeHead(303, securityHeaders({ Location: "/login", "Set-Cookie": cookies, "Cache-Control": "no-store" }));
      return res.end();
    }
    if (pathname.startsWith("/course")) {
      if (!student && !reviewer) return redirect(res, "/login");
      return serveCourse(req, res, pathname, reviewer ? "Revisor privado" : student.email, reviewer, reviewer ? "" : student.full_name);
    }
    send(res, 404, "Página no encontrada");
  } catch (error) {
    console.error(error);
    json(res, 500, { error: "Ocurrió un error local. Intente nuevamente." });
  }
});

server.listen(port, host, () => {
  console.log(`Curso privado disponible en http://${host}:${port}`);
  console.log(`Base de datos local: ${databasePath}`);
});

function shutdown() {
  server.close(() => { db.close(); process.exit(0); });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
