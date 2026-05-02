import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Story | Tech | Science
  available_quantity: integer("available_quantity").notNull().default(0),
  total_quantity: integer("total_quantity").notNull().default(0),
  image_url: text("image_url").notNull(),
  borrow_count: integer("borrow_count").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, created_at: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;

export const borrowsTable = pgTable("borrows", {
  id: serial("id").primaryKey(),
  book_id: integer("book_id").notNull().references(() => booksTable.id),
  user_id: text("user_id").notNull(),
  borrowed_at: timestamp("borrowed_at").defaultNow().notNull(),
  returned_at: timestamp("returned_at"),
});

export const insertBorrowSchema = createInsertSchema(borrowsTable).omit({ id: true, borrowed_at: true });
export type InsertBorrow = z.infer<typeof insertBorrowSchema>;
export type Borrow = typeof borrowsTable.$inferSelect;
