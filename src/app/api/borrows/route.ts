import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, booksTable, borrowsTable } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const borrows = await db
      .select({
        id: borrowsTable.id,
        book_id: borrowsTable.book_id,
        user_id: borrowsTable.user_id,
        borrowed_at: borrowsTable.borrowed_at,
        returned_at: borrowsTable.returned_at,
        book: booksTable,
      })
      .from(borrowsTable)
      .leftJoin(booksTable, eq(borrowsTable.book_id, booksTable.id))
      .where(eq(borrowsTable.user_id, userId));
    return NextResponse.json(borrows);
  } catch (err) {
    console.error("Failed to list borrows", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const book_id = parseInt(body.book_id, 10);
    if (isNaN(book_id)) {
      return NextResponse.json({ error: "Invalid book_id" }, { status: 400 });
    }

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, book_id));
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    if (book.available_quantity <= 0) {
      return NextResponse.json({ error: "No copies available" }, { status: 400 });
    }

    const [activeBorrow] = await db
      .select()
      .from(borrowsTable)
      .where(
        and(
          eq(borrowsTable.book_id, book_id),
          eq(borrowsTable.user_id, userId),
          isNull(borrowsTable.returned_at)
        )
      );
    if (activeBorrow) {
      return NextResponse.json(
        { error: "You already have this book borrowed" },
        { status: 400 }
      );
    }

    const [borrow] = await db
      .insert(borrowsTable)
      .values({ book_id, user_id: userId })
      .returning();

    await db
      .update(booksTable)
      .set({
        available_quantity: book.available_quantity - 1,
        borrow_count: book.borrow_count + 1,
      })
      .where(eq(booksTable.id, book_id));

    return NextResponse.json(borrow, { status: 201 });
  } catch (err) {
    console.error("Failed to borrow book", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
