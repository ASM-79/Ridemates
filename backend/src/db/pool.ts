import "../env.js";
import { Pool } from "pg";

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Strip sslmode from the URL — it overrides the explicit `ssl` option below
// and forces full CA verification, which DigitalOcean's managed Postgres
// cert chain fails without the DO CA bundle installed.
const connectionString = rawConnectionString.replace(/[?&]sslmode=[^&]*/, "");

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
