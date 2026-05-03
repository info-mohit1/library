import { NextRequest, NextResponse } from "next/server";
import { db, booksTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
    if (!book) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(book);
  } catch (err) {
    console.error("Failed to get book", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
