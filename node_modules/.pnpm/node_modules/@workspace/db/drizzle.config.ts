import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-load lib/db/.env so you don't need to set env vars manually
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "\n\nDATABASE_URL is not set!\n" +
    "Open lib/db/.env and set:\n" +
    "  DATABASE_URL=postgresql://user:password@host:5432/dbname\n" +
    "Get a free database at https://neon.tech\n"
  );
}
export default defineConfig({
  schema: "./src/schema/books.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
