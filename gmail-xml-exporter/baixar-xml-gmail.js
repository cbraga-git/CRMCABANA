import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(ROOT_DIR, "credentials.json");
const TOKEN_PATH = path.join(ROOT_DIR, "token.json");
const CONFIG_PATH = path.join(ROOT_DIR, "config.json");
const DEFAULT_CONFIG = {
  labelName: "NF Fabrica",
  outputDir: path.join(process.cwd(), "xml-nf-fabrica"),
};

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--help" || item === "-h") args.help = true;
    if (item === "--label") args.labelName = argv[index + 1];
    if (item === "--output") args.outputDir = argv[index + 1];
    if (item === "--query") args.query = argv[index + 1];
  }
  return args;
}

function showHelp() {
  console.log(`
Uso:
  npm run baixar
  npm run baixar -- --output "G:\\Meu Drive\\XML NF Fabrica"
  npm run baixar -- --label "NF Fabrica" --output "G:\\Meu Drive\\XML NF Fabrica"

Opcoes:
  --label   Nome do marcador do Gmail. Padrao: NF Fabrica
  --output  Diretorio onde os XML serao salvos.
  --query   Busca complementar do Gmail. Padrao: has:attachment filename:xml
`);
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadConfig() {
  const fileConfig = (await fileExists(CONFIG_PATH)) ? await readJson(CONFIG_PATH) : {};
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...parseArgs(process.argv.slice(2)),
  };
}

async function loadSavedCredentialsIfExist() {
  if (!(await fileExists(TOKEN_PATH))) return null;
  return readJson(TOKEN_PATH);
}

async function saveCredentials(credentials) {
  const keys = await readJson(CREDENTIALS_PATH);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload, "utf8");
}

async function postToken(params) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error_description || payload.error || "Falha ao autenticar no Google.");
  return payload;
}

async function refreshAccessToken(credentials) {
  const payload = await postToken({
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    refresh_token: credentials.refresh_token,
    grant_type: "refresh_token",
  });
  return payload.access_token;
}

async function authorize() {
  const savedClient = await loadSavedCredentialsIfExist();
  if (savedClient?.refresh_token) {
    return refreshAccessToken(savedClient);
  }

  if (!(await fileExists(CREDENTIALS_PATH))) {
    throw new Error(`Crie o arquivo de credenciais em ${CREDENTIALS_PATH}`);
  }

  const keys = await readJson(CREDENTIALS_PATH);
  const key = keys.installed || keys.web;
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (request, response) => {
      try {
        const requestUrl = new URL(request.url, `http://${request.headers.host}`);
        if (requestUrl.pathname !== "/oauth2callback") {
          response.writeHead(404);
          response.end("Nao encontrado.");
          return;
        }

        const code = requestUrl.searchParams.get("code");
        if (!code) throw new Error("Codigo de autorizacao nao recebido.");

        const tokens = await postToken({
          client_id: key.client_id,
          client_secret: key.client_secret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        });
        await saveCredentials(tokens);

        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end("<h1>Autorizacao concluida</h1><p>Voce ja pode voltar ao terminal.</p>");
        server.close();
        resolve(tokens.access_token);
      } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(error.message || "Erro na autorizacao.");
        server.close();
        reject(error);
      }
    });

    let redirectUri = "";
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
      const authParams = new URLSearchParams({
        client_id: key.client_id,
        redirect_uri: redirectUri,
        response_type: "code",
        access_type: "offline",
        scope: SCOPES.join(" "),
        prompt: "consent",
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams}`;

      console.log("Autorize o acesso abrindo esta URL:");
      console.log(authUrl);
    });
  });
}

async function gmailGet(accessToken, endpoint, params = {}) {
  const url = new URL(`${GMAIL_API}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  });
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "Falha ao consultar Gmail.");
  return payload;
}

async function findLabelId(accessToken, labelName) {
  const response = await gmailGet(accessToken, "/labels");
  const label = response.labels?.find((item) => item.name.toLowerCase() === labelName.toLowerCase());
  if (!label) throw new Error(`Marcador nao encontrado no Gmail: ${labelName}`);
  return label.id;
}

async function listMessageIds(accessToken, labelId, query) {
  const ids = [];
  let pageToken;

  do {
    const response = await gmailGet(accessToken, "/messages", {
      labelIds: [labelId],
      q: query || "has:attachment filename:xml",
      pageToken,
      maxResults: 500,
    });
    ids.push(...(response.messages || []).map((message) => message.id));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return ids;
}

function collectXmlParts(parts = [], collected = []) {
  for (const part of parts) {
    if (part.parts?.length) collectXmlParts(part.parts, collected);
    const filename = part.filename || "";
    const mimeType = part.mimeType || "";
    const attachmentId = part.body?.attachmentId;
    const isXml = filename.toLowerCase().endsWith(".xml") || mimeType.toLowerCase().includes("xml");
    if (attachmentId && isXml) {
      collected.push({
        attachmentId,
        filename: filename || `anexo-${attachmentId}.xml`,
        mimeType,
      });
    }
  }
  return collected;
}

function decodeBase64Url(data) {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sanitizeFileName(filename) {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

async function uniqueOutputPath(outputDir, filename) {
  const parsed = path.parse(sanitizeFileName(filename));
  let candidate = path.join(outputDir, `${parsed.name}${parsed.ext || ".xml"}`);
  let counter = 2;

  while (await fileExists(candidate)) {
    candidate = path.join(outputDir, `${parsed.name}-${counter}${parsed.ext || ".xml"}`);
    counter += 1;
  }

  return candidate;
}

async function downloadAttachment(accessToken, messageId, part, outputDir) {
  const response = await gmailGet(accessToken, `/messages/${messageId}/attachments/${part.attachmentId}`);
  const buffer = decodeBase64Url(response.data || "");
  const outputPath = await uniqueOutputPath(outputDir, part.filename);
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

async function main() {
  const config = await loadConfig();
  if (config.help) {
    showHelp();
    return;
  }

  const outputDir = path.resolve(config.outputDir);
  await fs.mkdir(outputDir, { recursive: true });

  const accessToken = await authorize();
  const labelId = await findLabelId(accessToken, config.labelName);
  const messageIds = await listMessageIds(accessToken, labelId, config.query);

  let savedCount = 0;
  for (const messageId of messageIds) {
    const message = await gmailGet(accessToken, `/messages/${messageId}`, {
      format: "full",
    });
    const parts = collectXmlParts(message.payload ? [message.payload] : []);
    for (const part of parts) {
      const outputPath = await downloadAttachment(accessToken, messageId, part, outputDir);
      savedCount += 1;
      console.log(`Salvo: ${outputPath}`);
    }
  }

  console.log("");
  console.log(`Marcador: ${config.labelName}`);
  console.log(`Mensagens analisadas: ${messageIds.length}`);
  console.log(`Arquivos XML salvos: ${savedCount}`);
  console.log(`Diretorio: ${outputDir}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
