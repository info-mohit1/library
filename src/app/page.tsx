"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookCard, type Book } from "@/components/book-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  BookOpen,
  Quote,
  Library,
  Flame,
  Compass,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface LibraryStats {
  total_books: number;
  total_available: number;
  total_borrows: number;
  categories: { category: string; count: number; available: number }[];
}

const testimonials = [
  {
    id: 1,
    text: "The ambiance of a physical bookstore, beautifully translated to the screen. A joy to use.",
    author: "Eleanor V.",
    role: "Avid Reader",
  },
  {
    id: 2,
    text: "I've discovered so many hidden gems through their curated categories. Exceptional collection.",
    author: "Marcus T.",
    role: "Librarian",
  },
  {
    id: 3,
    text: "Borrowing and returning is seamless. This app reignited my passion for reading.",
    author: "Sarah J.",
    role: "Student",
  },
];

export default function Home() {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });

  useEffect(() => {
    fetch("/api/books/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
    fetch("/api/books/featured")
      .then((r) => r.json())
      .then((books: Book[]) => {
        setFeaturedBooks(books);
        setIsFeaturedLoading(false);
      })
      .catch(() => setIsFeaturedLoading(false));
    fetch("/api/books?limit=10")
      .then((r) => r.json())
      .then((data: { books: Book[] }) => setRecentBooks(data.books || []))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#2D241C] text-[#FAF7F2] py-20 lg:py-32">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #A3501E 0%, transparent 60%)",
          }}
        />
        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          <Badge className="mb-6 bg-[#A3501E]/20 text-[#A3501E] border-[#A3501E]/30 hover:bg-[#A3501E]/30">
            Curated Digital Library
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6 max-w-4xl leading-tight">
            Discover your next{" "}
            <span className="text-[#A3501E] italic">great story</span>
          </h1>
          <p className="text-lg md:text-xl text-[#E5DCCF] max-w-2xl mb-10 font-light leading-relaxed">
            Welcome to BookVerse, a sanctuary for bibliophiles. Explore our
            handpicked collection spanning gripping fiction to cutting-edge
            science.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/all-books">
              <Button
                size="lg"
                className="bg-[#A3501E] text-white hover:bg-[#8A4319] text-lg px-8 py-6 rounded-xl border-none shadow-lg"
              >
                Browse Collection
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-[#E5DCCF]/30 hover:bg-white/10 text-lg px-8 py-6 rounded-xl bg-transparent"
              >
                Join the Library
              </Button>
            </Link>
          </div>

          {stats && (
            <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-serif font-bold text-[#FAF7F2]">
                  {stats.total_books}+
                </p>
                <p className="text-sm text-[#E5DCCF]/60 mt-1 uppercase tracking-wider font-medium">
                  Books
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-serif font-bold text-[#FAF7F2]">
                  {stats.total_available}
                </p>
                <p className="text-sm text-[#E5DCCF]/60 mt-1 uppercase tracking-wider font-medium">
                  Available
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-serif font-bold text-[#FAF7F2]">
                  {stats.total_borrows}+
                </p>
                <p className="text-sm text-[#E5DCCF]/60 mt-1 uppercase tracking-wider font-medium">
                  Borrows
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Browse by Category
          </h2>
          <Link
            href="/all-books"
            className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              label: "Stories & Fiction",
              cat: "Story",
              icon: <BookOpen className="h-6 w-6" />,
              color: "from-amber-900/80 to-amber-700/60",
              count: stats?.categories.find((c) => c.category === "Story")?.count ?? "—",
            },
            {
              label: "Technology",
              cat: "Tech",
              icon: <Flame className="h-6 w-6" />,
              color: "from-emerald-900/80 to-emerald-700/60",
              count: stats?.categories.find((c) => c.category === "Tech")?.count ?? "—",
            },
            {
              label: "Science",
              cat: "Science",
              icon: <Compass className="h-6 w-6" />,
              color: "from-blue-900/80 to-blue-700/60",
              count: stats?.categories.find((c) => c.category === "Science")?.count ?? "—",
            },
          ].map((cat) => (
            <Link href={`/all-books?category=${cat.cat}`} key={cat.cat}>
              <div
                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-white h-40 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-md`}
              >
                <div className="bg-white/20 rounded-xl w-12 h-12 flex items-center justify-center">
                  {cat.icon}
                </div>
                <div>
                  <p className="font-serif font-bold text-lg">{cat.label}</p>
                  <p className="text-white/70 text-sm">{cat.count} books</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Library className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Most Borrowed
            </h2>
          </div>
          {isFeaturedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-60 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Books Carousel */}
      {recentBooks.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Recently Added
            </h2>
            <Link
              href="/all-books"
              className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
            >
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex-[0_0_calc(50%-8px)] md:flex-[0_0_calc(25%-12px)] min-w-0">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-[#2D241C]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <Quote className="h-5 w-5 text-[#A3501E]" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF7F2]">
              What Readers Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <Quote className="h-5 w-5 text-[#A3501E] mb-4 opacity-60" />
                <p className="text-[#E5DCCF] italic mb-6 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-[#FAF7F2]">{t.author}</p>
                  <p className="text-[#E5DCCF]/50 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Ready to start reading?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
          Join thousands of readers. Create a free account and start borrowing
          today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl"
            >
              Create Free Account
            </Button>
          </Link>
          <Link href="/all-books">
            <Button size="lg" variant="outline" className="px-8 rounded-xl">
              Explore Books
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
