import { NextResponse } from "next/server";
import { db, booksTable } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .orderBy(sql`${booksTable.borrow_count} DESC`)
      .limit(4);
    return NextResponse.json(books);
  } catch (err) {
    console.error("Failed to get featured books", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
