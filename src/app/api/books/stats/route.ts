import { NextResponse } from "next/server";
import { db, booksTable } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const [totalRow] = await db
      .select({
        total_books: sql<number>`count(*)::int`,
        total_available: sql<number>`sum(${booksTable.available_quantity})::int`,
        total_borrows: sql<number>`sum(${booksTable.borrow_count})::int`,
      })
      .from(booksTable);

    const categories = await db
      .select({
        category: booksTable.category,
        count: sql<number>`count(*)::int`,
        available: sql<number>`sum(${booksTable.available_quantity})::int`,
      })
      .from(booksTable)
      .groupBy(booksTable.category);

    return NextResponse.json({
      total_books: totalRow?.total_books ?? 0,
      total_available: totalRow?.total_available ?? 0,
      total_borrows: totalRow?.total_borrows ?? 0,
      categories,
    });
  } catch (err) {
    console.error("Failed to get stats", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
