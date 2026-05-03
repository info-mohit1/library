import { NextRequest, NextResponse } from "next/server";
import { db, booksTable } from "@/lib/db";
import { eq, like, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const conditions = [];
    if (category && ["Story", "Tech", "Science"].includes(category)) {
      conditions.push(eq(booksTable.category, category));
    }
    if (search) {
      conditions.push(like(booksTable.title, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [books, totalRow] = await Promise.all([
      db.select().from(booksTable).where(where).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(booksTable)
        .where(where),
    ]);

    return NextResponse.json({ books, total: totalRow[0]?.count ?? 0 });
  } catch (err) {
    console.error("Failed to list books", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
