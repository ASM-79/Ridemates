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

await client.connect();
try {
  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log(res.rows.map((r) => r.table_name).join("\n"));
} finally {
  await client.end();
}
