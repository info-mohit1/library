import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  available_quantity: integer("available_quantity").notNull().default(0),
  total_quantity: integer("total_quantity").notNull().default(0),
  image_url: text("image_url").notNull(),
  borrow_count: integer("borrow_count").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Book = typeof booksTable.$inferSelect;

export const borrowsTable = pgTable("borrows", {
  id: serial("id").primaryKey(),
  book_id: integer("book_id").notNull().references(() => booksTable.id),
  user_id: text("user_id").notNull(),
  borrowed_at: timestamp("borrowed_at").defaultNow().notNull(),
  returned_at: timestamp("returned_at"),
});

export type Borrow = typeof borrowsTable.$inferSelect;
