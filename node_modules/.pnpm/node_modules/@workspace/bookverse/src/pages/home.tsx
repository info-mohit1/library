import { useGetBooksStats, useListBooks, useGetFeaturedBooks } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookCard } from "@/components/book-card";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, BookOpen, Quote, Library, Flame, Compass } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats } = useGetBooksStats();
  const { data: featuredBooks, isLoading: isFeaturedLoading } = useGetFeaturedBooks();
  const { data: recentBooks } = useListBooks({ limit: 10 });
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true, skipSnaps: false });

  const testimonials = [
    { id: 1, text: "The ambiance of a physical bookstore, beautifully translated to the screen. A joy to use.", author: "Eleanor V.", role: "Avid Reader" },
    { id: 2, text: "I've discovered so many hidden gems through their curated categories. Exceptional collection.", author: "Marcus T.", role: "Librarian" },
    { id: 3, text: "Borrowing and returning is seamless. This app reignited my passion for reading.", author: "Sarah J.", role: "Student" },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#2D241C] text-[#FAF7F2] py-20 lg:py-32">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #A3501E 0%, transparent 60%)' }} />
        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          <Badge className="mb-6 bg-[#A3501E]/20 text-[#A3501E] border-[#A3501E]/30 hover:bg-[#A3501E]/30">Curated Digital Library</Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6 max-w-4xl leading-tight">
            Discover your next <span className="text-[#A3501E] italic">great story</span>
          </h1>
          <p className="text-lg md:text-xl text-[#E5DCCF] max-w-2xl mb-10 font-light leading-relaxed">
            Welcome to BookVerse, a sanctuary for bibliophiles. Explore our handpicked collection spanning gripping fiction to cutting-edge science.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/all-books">
              <Button size="lg" className="bg-[#A3501E] text-white hover:bg-[#8A4319] text-lg px-8 py-6 rounded-xl border-none shadow-lg">
                Browse Collection
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="text-white border-[#E5DCCF]/30 hover:bg-white/10 text-lg px-8 py-6 rounded-xl bg-transparent">
                Join the Library
              </Button>
            </Link>
          </div>

          {stats && (
            <div className="mt-16 pt-8 border-t border-[#E5DCCF]/20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center w-full max-w-4xl">
              <div>
                <p className="text-3xl font-serif font-bold text-[#A3501E]">{stats.total_books}</p>
                <p className="text-sm text-[#E5DCCF]/80 uppercase tracking-wider mt-1 font-medium">Titles</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-[#A3501E]">{stats.total_borrows}</p>
                <p className="text-sm text-[#E5DCCF]/80 uppercase tracking-wider mt-1 font-medium">Total Borrows</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-[#A3501E]">{stats.categories.length}</p>
                <p className="text-sm text-[#E5DCCF]/80 uppercase tracking-wider mt-1 font-medium">Categories</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-[#A3501E]">{stats.total_available}</p>
                <p className="text-sm text-[#E5DCCF]/80 uppercase tracking-wider mt-1 font-medium">Available Now</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Marquee - New Arrivals */}
      <div className="bg-primary/5 py-4 border-y border-border overflow-hidden flex items-center">
        <div className="whitespace-nowrap flex items-center gap-8 animate-marquee">
          {recentBooks?.books.map((book) => (
            <span key={book.id} className="text-lg font-serif font-medium text-foreground flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-primary" />
              {book.title} <span className="text-muted-foreground text-sm font-sans ml-2">— {book.author}</span>
            </span>
          ))}
          {/* Duplicate for seamless looping */}
          {recentBooks?.books.map((book) => (
            <span key={`${book.id}-dup`} className="text-lg font-serif font-medium text-foreground flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-primary" />
              {book.title} <span className="text-muted-foreground text-sm font-sans ml-2">— {book.author}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Featured Books Carousel */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
              <Flame className="h-8 w-8 text-primary" /> 
              Most Borrowed
            </h2>
            <p className="text-muted-foreground text-lg">The community's favorite reads</p>
          </div>
          <Link href="/all-books">
            <Button variant="ghost" className="hidden sm:flex hover:text-primary">
              View all <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {isFeaturedLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                  </div>
                ))
              ) : featuredBooks?.map((book) => (
                <div key={book.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Link href="/all-books" className="mt-8 flex sm:hidden w-full">
          <Button variant="outline" className="w-full">
            View all books
          </Button>
        </Link>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Compass className="h-8 w-8 text-secondary" />
              Explore Collections
            </h2>
            <p className="text-muted-foreground text-lg">Find your niche among our carefully categorized shelves.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/all-books?category=Story">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full border-border/50">
                <div className="h-48 bg-[#A3501E]/10 flex items-center justify-center group-hover:bg-[#A3501E]/20 transition-colors">
                  <Library className="h-16 w-16 text-[#A3501E] opacity-80 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-serif font-bold mb-2">Stories & Fiction</h3>
                  <p className="text-muted-foreground">Immerse yourself in captivating narratives, classic literature, and contemporary fiction.</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/all-books?category=Tech">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full border-border/50">
                <div className="h-48 bg-[#2A4036]/10 flex items-center justify-center group-hover:bg-[#2A4036]/20 transition-colors">
                  <Compass className="h-16 w-16 text-[#2A4036] opacity-80 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-serif font-bold mb-2">Technology</h3>
                  <p className="text-muted-foreground">Stay ahead of the curve with our extensive collection of programming and tech literature.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/all-books?category=Science">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full border-border/50">
                <div className="h-48 bg-blue-900/10 flex items-center justify-center group-hover:bg-blue-900/20 transition-colors">
                  <BookOpen className="h-16 w-16 text-blue-800 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-serif font-bold mb-2">Science</h3>
                  <p className="text-muted-foreground">Explore the wonders of the universe, from popular science to academic texts.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center text-foreground mb-12">What our readers say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.id} className="bg-card border-none shadow-sm hover:shadow-md transition-shadow relative">
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10" />
              <CardContent className="p-8 flex flex-col h-full">
                <p className="text-lg italic text-foreground/80 mb-6 flex-1">"{t.text}"</p>
                <div className="border-t border-border pt-4 mt-auto">
                  <p className="font-serif font-bold text-foreground">{t.author}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// Needed a Badge component inline since we used it in Hero
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
