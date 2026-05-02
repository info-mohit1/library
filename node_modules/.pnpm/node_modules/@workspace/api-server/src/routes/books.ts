import { Router } from "express";
import { db, booksTable } from "@workspace/db";
import { eq, like, and, sql } from "drizzle-orm";
import { ListBooksQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/books/featured", async (req, res) => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .orderBy(sql`${booksTable.borrow_count} DESC`)
      .limit(4);
    res.json(books);
  } catch (err) {
    req.log.error({ err }, "Failed to get featured books");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/books/stats", async (req, res) => {
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

    res.json({
      total_books: totalRow?.total_books ?? 0,
      total_available: totalRow?.total_available ?? 0,
      total_borrows: totalRow?.total_borrows ?? 0,
      categories,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/books", async (req, res) => {
  try {
    const parsed = ListBooksQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : { limit: 50, offset: 0 };

    const conditions = [];
    if (params.category) {
      conditions.push(eq(booksTable.category, params.category));
    }
    if (params.search) {
      conditions.push(like(booksTable.title, `%${params.search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [books, totalRow] = await Promise.all([
      db
        .select()
        .from(booksTable)
        .where(where)
        .limit(params.limit ?? 50)
        .offset(params.offset ?? 0),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(booksTable)
        .where(where),
    ]);

    res.json({ books, total: totalRow[0]?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to list books");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/books/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  } catch (err) {
    req.log.error({ err }, "Failed to get book");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
