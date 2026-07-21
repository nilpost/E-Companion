import { defineConfig } from "drizzle-kit";

// Migrations use the direct connection (bypasses the Supabase pooler, which
// doesn't support all session-level DDL). Fall back to the pooled URL when
// DATABASE_URL_DIRECT isn't set.
const migrationUrl = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DATABASE_URL_DIRECT or DATABASE_URL must be set, ensure the database is provisioned",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
});
