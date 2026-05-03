"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookCard, type Book } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, BookOpen } from "lucide-react";

const VALID_CATEGORIES = ["Story", "Tech", "Science"] as const;
type BookCategory = (typeof VALID_CATEGORIES)[number];

function AllBooksContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category");
  const validInitial =
    initialCat && VALID_CATEGORIES.includes(initialCat as BookCategory)
      ? (initialCat as BookCategory)
      : "All";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<BookCategory | "All">(validInitial);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category !== "All") params.set("category", category);
    fetch(`/api/books?${params.toString()}`)
      .then((r) => r.json())
      .then((data: { books: Book[]; total: number }) => {
        setBooks(data.books || []);
        setTotal(data.total || 0);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [debouncedSearch, category]);

  const categories: (BookCategory | "All")[] = ["All", "Story", "Tech", "Science"];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div>
            <h2 className="text-lg font-serif font-bold mb-4">Categories</h2>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "ghost"}
                  className="justify-start w-full text-left"
                  onClick={() => setCategory(cat)}
                >
                  {cat === "All" ? "All Books" : cat}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {category === "All" ? "Library Collection" : `${category} Books`}
            </h1>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 bg-background border-border/60 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-serif font-semibold mb-2">
                No books found
              </h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or browsing a different category.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {books.length} of {total} books
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AllBooksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AllBooksContent />
    </Suspense>
  );
}
