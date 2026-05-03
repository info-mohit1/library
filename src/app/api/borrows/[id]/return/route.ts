import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, booksTable, borrowsTable } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const [borrow] = await db
      .select()
      .from(borrowsTable)
      .where(and(eq(borrowsTable.id, id), eq(borrowsTable.user_id, userId)));

    if (!borrow) {
      return NextResponse.json({ error: "Borrow not found" }, { status: 404 });
    }
    if (borrow.returned_at) {
      return NextResponse.json({ error: "Already returned" }, { status: 400 });
    }

    const [updated] = await db
      .update(borrowsTable)
      .set({ returned_at: new Date() })
      .where(eq(borrowsTable.id, id))
      .returning();

    await db
      .update(booksTable)
      .set({ available_quantity: sql`${booksTable.available_quantity} + 1` })
      .where(eq(booksTable.id, borrow.book_id));

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to return book", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
