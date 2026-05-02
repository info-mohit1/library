import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useListBooks, ListBooksCategory } from "@workspace/api-client-react";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, BookOpen } from "lucide-react";

const VALID_CATEGORIES: ListBooksCategory[] = ["Story", "Tech", "Science"];

export default function AllBooks() {
  const searchStr = useSearch();

  const getInitialCategory = (): ListBooksCategory | "All" => {
    const params = new URLSearchParams(searchStr);
    const cat = params.get("category");
    return cat && VALID_CATEGORIES.includes(cat as ListBooksCategory)
      ? (cat as ListBooksCategory)
      : "All";
  };

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<ListBooksCategory | "All">(getInitialCategory);

  useEffect(() => {
    const params = new URLSearchParams(searchStr);
    const cat = params.get("category");
    if (cat && VALID_CATEGORIES.includes(cat as ListBooksCategory)) {
      setCategory(cat as ListBooksCategory);
    }
  }, [searchStr]);

  const { data, isLoading } = useListBooks({
    search: debouncedSearch || undefined,
    category: category !== "All" ? category : undefined,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const categories: (ListBooksCategory | "All")[] = ["All", "Story", "Tech", "Science"];

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
                  data-testid={`category-filter-${cat}`}
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
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data?.books && data.books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border/50">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-serif font-bold mb-2">No books found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or category filters to find what you're looking for.
              </p>
              {(search || category !== "All") && (
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    setCategory("All");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
