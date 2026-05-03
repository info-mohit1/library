import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (_db) return _db;
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Add it to your .env.local file.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  _db = drizzle(pool, { schema });
  return _db;
}

 
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const database = getDb();
     
    return (database as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export * from "./schema";