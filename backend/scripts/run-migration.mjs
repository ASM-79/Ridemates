import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Client } = pg;
const raw = process.env.DATABASE_URL;
const connectionString = raw.replace(/[?&]sslmode=[^&]*/, "");
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

const migrationPath = process.argv[2];
const sql = readFileSync(migrationPath, "utf8");

await client.connect();
try {
  await client.query(sql);
  console.log(`Applied ${migrationPath}`);
} finally {
  await client.end();
}
