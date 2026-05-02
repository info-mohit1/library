import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { booksTable } from "./schema/books";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-load lib/db/.env
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}


const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in lib/db/.env");
}

const { Pool } = pg;
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

const books = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan set in the Jazz Age on Long Island.",
    category: "Story",
    available_quantity: 4,
    total_quantity: 5,
    image_url: "https://covers.openlibrary.org/b/id/8432674-L.jpg",
    borrow_count: 18,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    category: "Story",
    available_quantity: 3,
    total_quantity: 4,
    image_url: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
    borrow_count: 24,
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism and mass surveillance.",
    category: "Story",
    available_quantity: 2,
    total_quantity: 3,
    image_url: "https://covers.openlibrary.org/b/id/8575708-L.jpg",
    borrow_count: 31,
  },
  {
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    description: "A guide for software developers on how to become better programmers through practical advice.",
    category: "Tech",
    available_quantity: 5,
    total_quantity: 5,
    image_url: "https://covers.openlibrary.org/b/id/9966549-L.jpg",
    borrow_count: 22,
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "A handbook of agile software craftsmanship that helps programmers write better code.",
    category: "Tech",
    available_quantity: 3,
    total_quantity: 4,
    image_url: "https://covers.openlibrary.org/b/id/8675313-L.jpg",
    borrow_count: 29,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description: "A landmark volume in science writing by one of the great minds of our time.",
    category: "Science",
    available_quantity: 4,
    total_quantity: 5,
    image_url: "https://covers.openlibrary.org/b/id/8091016-L.jpg",
    borrow_count: 27,
  },
  {
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    description: "A comedic science fiction series following Arthur Dent as he travels through space after Earth is destroyed.",
    category: "Story",
    available_quantity: 3,
    total_quantity: 4,
    image_url: "https://covers.openlibrary.org/b/id/8476341-L.jpg",
    borrow_count: 15,
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    description: "The best book on building reliable, scalable, and maintainable systems.",
    category: "Tech",
    available_quantity: 2,
    total_quantity: 3,
    image_url: "https://covers.openlibrary.org/b/id/10521052-L.jpg",
    borrow_count: 19,
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    description: "A book on evolution that introduced the concept of the gene as the unit of selection.",
    category: "Science",
    available_quantity: 4,
    total_quantity: 5,
    image_url: "https://covers.openlibrary.org/b/id/8739984-L.jpg",
    borrow_count: 14,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description: "An epic science fiction masterpiece set on the desert planet Arrakis following Paul Atreides.",
    category: "Story",
    available_quantity: 1,
    total_quantity: 3,
    image_url: "https://covers.openlibrary.org/b/id/10898725-L.jpg",
    borrow_count: 33,
  },
  {
    title: "The Code Book",
    author: "Simon Singh",
    description: "A journey through the history of secret writing and cryptography.",
    category: "Tech",
    available_quantity: 3,
    total_quantity: 4,
    image_url: "https://covers.openlibrary.org/b/id/8224465-L.jpg",
    borrow_count: 11,
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    description: "A personal voyage through the universe, exploring the origin of life and humanity's place in the stars.",
    category: "Science",
    available_quantity: 4,
    total_quantity: 5,
    image_url: "https://covers.openlibrary.org/b/id/8386725-L.jpg",
    borrow_count: 20,
  },
];

async function seed() {
  console.log("Seeding 12 books...");
  await db.insert(booksTable).values(books);
  console.log("Done! 12 books inserted.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  pool.end();
  process.exit(1);
});
