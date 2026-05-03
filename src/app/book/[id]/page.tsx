"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import { type Book } from "@/components/book-card";
import { format } from "date-fns";

interface Borrow {
  id: number;
  book_id: number;
  user_id: string;
  borrowed_at: string;
  returned_at: string | null;
  book: Book | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Story: "bg-amber-900/20 text-amber-900 border-amber-900/30",
  Tech: "bg-emerald-900/20 text-emerald-900 border-emerald-900/30",
  Science: "bg-blue-900/20 text-blue-900 border-blue-900/30",
};

export default function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const bookId = Number(idStr);
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [myBorrows, setMyBorrows] = useState<Borrow[]>([]);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [isBorrowsLoading, setIsBorrowsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch(`/api/books/${bookId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((b: Book) => {
        setBook(b);
        setIsBookLoading(false);
      })
      .catch(() => setIsBookLoading(false));
  }, [bookId]);

  useEffect(() => {
    if (!authLoaded || !isSignedIn) {
      setIsBorrowsLoading(false);
      return;
    }
    fetch("/api/borrows")
      .then((r) => r.json())
      .then((borrows: Borrow[]) => {
        setMyBorrows(borrows);
        setIsBorrowsLoading(false);
      })
      .catch(() => setIsBorrowsLoading(false));
  }, [authLoaded, isSignedIn]);

  const refreshData = async () => {
    const [bookRes, borrowsRes] = await Promise.all([
      fetch(`/api/books/${bookId}`).then((r) => r.json()),
      isSignedIn
        ? fetch("/api/borrows").then((r) => r.json())
        : Promise.resolve([]),
    ]);
    setBook(bookRes);
    if (isSignedIn) setMyBorrows(borrowsRes);
  };

  const handleBorrow = async () => {
    setIsBorrowing(true);
    try {
      const res = await fetch("/api/borrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to borrow");
      toast.success("Book borrowed successfully!");
      await refreshData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to borrow book");
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleReturn = async (borrowId: number) => {
    setIsReturning(true);
    try {
      const res = await fetch(`/api/borrows/${borrowId}/return`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to return");
      toast.success("Book returned successfully!");
      await refreshData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to return book");
    } finally {
      setIsReturning(false);
    }
  };

  if (isBookLoading || (isSignedIn && isBorrowsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold">Book not found</h2>
        <p className="text-muted-foreground mt-2 mb-6">
          The book you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/all-books">
          <Button>Browse All Books</Button>
        </Link>
      </div>
    );
  }

  const activeBorrow = myBorrows.find(
    (b) => b.book_id === bookId && b.returned_at === null
  );
  const hasBorrowed = !!activeBorrow;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <Link
        href="/all-books"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Library
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Book cover */}
        <div className="w-full max-w-sm mx-auto md:mx-0">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-xl bg-muted/30">
            {book.image_url && !imgError ? (
              <img
                src={book.image_url}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-[#2D241C] to-[#A3501E]/60 text-[#FAF7F2] p-8 gap-4">
                <BookOpen className="h-16 w-16 opacity-30" />
                <p className="text-center font-serif font-bold text-xl leading-snug opacity-70">
                  {book.title}
                </p>
                <p className="text-sm opacity-50 text-center">{book.author}</p>
              </div>
            )}
          </div>
        </div>

        {/* Book details */}
        <div className="space-y-6">
          <div>
            <Badge
              variant="secondary"
              className={`mb-3 ${CATEGORY_COLORS[book.category] ?? ""}`}
            >
              {book.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              by {book.author}
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${book.available_quantity > 0 ? "bg-secondary" : "bg-destructive"}`}
              />
              <span
                className={
                  book.available_quantity > 0
                    ? "text-secondary font-medium"
                    : "text-destructive font-medium"
                }
              >
                {book.available_quantity > 0
                  ? `${book.available_quantity} of ${book.total_quantity} available`
                  : "Out of stock"}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {book.borrow_count} borrows
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 p-5 border border-border/50">
            <h3 className="font-serif font-semibold mb-2 text-foreground">
              About this book
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {book.description}
            </p>
          </div>

          {hasBorrowed && activeBorrow && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  Currently borrowed
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Since{" "}
                  {format(
                    new Date(activeBorrow.borrowed_at),
                    "MMMM d, yyyy"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Borrow / Return CTA */}
          <div className="pt-2">
            {!authLoaded ? (
              <Button disabled className="w-full h-12">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </Button>
            ) : !isSignedIn ? (
              <div className="space-y-3">
                <Link href="/sign-in">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90">
                    Sign in to Borrow
                  </Button>
                </Link>
                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-primary hover:underline font-medium"
                  >
                    Register for free
                  </Link>
                </p>
              </div>
            ) : hasBorrowed ? (
              <Button
                onClick={() => activeBorrow && handleReturn(activeBorrow.id)}
                disabled={isReturning}
                variant="outline"
                className="w-full h-12 border-primary/30 text-primary hover:bg-primary/5"
              >
                {isReturning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Returning...
                  </>
                ) : (
                  "Return Book"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleBorrow}
                disabled={
                  isBorrowing || book.available_quantity <= 0
                }
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                {isBorrowing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Borrowing...
                  </>
                ) : book.available_quantity <= 0 ? (
                  "Unavailable"
                ) : (
                  "Borrow this Book"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
