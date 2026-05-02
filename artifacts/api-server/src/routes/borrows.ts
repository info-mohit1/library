import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, booksTable, borrowsTable } from "@workspace/db";
import { eq, isNull, and, sql } from "drizzle-orm";
import { BorrowBookBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  next();
}

router.get("/borrows", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
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
      .where(eq(borrowsTable.user_id, userId!));
    res.json(borrows);
  } catch (err) {
    req.log.error({ err }, "Failed to list borrows");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/borrows", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const parsed = BorrowBookBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

    const { book_id } = parsed.data;

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, book_id));
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.available_quantity <= 0) return res.status(400).json({ error: "No copies available" });

    const [activeBorrow] = await db
      .select()
      .from(borrowsTable)
      .where(and(eq(borrowsTable.book_id, book_id), eq(borrowsTable.user_id, userId!), isNull(borrowsTable.returned_at)));
    if (activeBorrow) return res.status(400).json({ error: "You already have this book borrowed" });

    const [borrow] = await db.insert(borrowsTable).values({ book_id, user_id: userId! }).returning();

    await db
      .update(booksTable)
      .set({
        available_quantity: book.available_quantity - 1,
        borrow_count: book.borrow_count + 1,
      })
      .where(eq(booksTable.id, book_id));

    res.status(201).json(borrow);
  } catch (err) {
    req.log.error({ err }, "Failed to borrow book");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/borrows/:id/return", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [borrow] = await db.select().from(borrowsTable).where(and(eq(borrowsTable.id, id), eq(borrowsTable.user_id, userId!)));
    if (!borrow) return res.status(404).json({ error: "Borrow not found" });
    if (borrow.returned_at) return res.status(400).json({ error: "Already returned" });

    const [updated] = await db
      .update(borrowsTable)
      .set({ returned_at: new Date() })
      .where(eq(borrowsTable.id, id))
      .returning();

    await db
      .update(booksTable)
      .set({ available_quantity: sql`${booksTable.available_quantity} + 1` })
      .where(eq(booksTable.id, borrow.book_id));

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to return book");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
