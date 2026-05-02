import { useAuth } from "@clerk/react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetBook, 
  useListMyBorrows, 
  useBorrowBook, 
  useReturnBook,
  getGetBookQueryKey,
  getListMyBorrowsQueryKey,
  getGetBooksStatsQueryKey,
  getListBooksQueryKey
} from "@workspace/api-client-react";

export default function BookDetails() {
  const [, params] = useRoute("/book/:id");
  const bookId = Number(params?.id);
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();

  const { data: book, isLoading: isBookLoading } = useGetBook(bookId, {
    query: { enabled: !!bookId, queryKey: getGetBookQueryKey(bookId) }
  });

  const { data: myBorrows, isLoading: isBorrowsLoading } = useListMyBorrows({
    query: { enabled: isSignedIn, queryKey: getListMyBorrowsQueryKey() }
  });

  const borrowMutation = useBorrowBook({
    mutation: {
      onSuccess: () => {
        toast.success("Book borrowed successfully!");
        queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
        queryClient.invalidateQueries({ queryKey: getListMyBorrowsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBooksStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      },
      onError: (err: any) => {
        toast.error(err?.data?.message || "Failed to borrow book");
      }
    }
  });

  const returnMutation = useReturnBook({
    mutation: {
      onSuccess: () => {
        toast.success("Book returned successfully!");
        queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
        queryClient.invalidateQueries({ queryKey: getListMyBorrowsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBooksStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      },
      onError: (err: any) => {
        toast.error(err?.data?.message || "Failed to return book");
      }
    }
  });

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
        <p className="text-muted-foreground mt-2 mb-6">The book you're looking for doesn't exist or has been removed.</p>
        <Link href="/all-books">
          <Button>Browse All Books</Button>
        </Link>
      </div>
    );
  }

  const activeBorrow = myBorrows?.find(b => b.book_id === bookId && b.returned_at === null);
  const hasBorrowed = !!activeBorrow;
  const isAvailable = book.available_quantity > 0;

  const handleBorrow = () => {
    borrowMutation.mutate({ data: { book_id: bookId } });
  };

  const handleReturn = () => {
    if (activeBorrow) {
      returnMutation.mutate({ id: activeBorrow.id });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link href="/all-books" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to library
        </Link>
      </div>

      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 bg-card rounded-2xl border border-border/50 p-6 md:p-8 lg:p-12 shadow-sm">
        {/* Left: Book Cover */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-muted/30 border border-border/50">
            {book.image_url ? (
              <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <BookOpen className="h-16 w-16 opacity-20" />
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs bg-secondary/10 text-secondary hover:bg-secondary/20">
                {book.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium">By {book.author}</p>
            </div>
          </div>

          <div className="prose prose-stone dark:prose-invert max-w-none my-8">
            <p className="text-foreground/80 leading-relaxed text-lg">
              {book.description || "No description available for this book."}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-border/50">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Availability</p>
              <p className={`font-semibold ${isAvailable ? "text-secondary" : "text-destructive"}`}>
                {book.available_quantity} / {book.total_quantity}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Borrows</p>
              <p className="font-semibold text-foreground">{book.borrow_count}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center gap-4">
            {hasBorrowed ? (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  size="lg" 
                  onClick={handleReturn} 
                  disabled={returnMutation.isPending}
                  className="w-full sm:w-auto min-w-[200px] text-base"
                  data-testid="button-return"
                >
                  {returnMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Return Book"}
                </Button>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="mr-1.5 h-4 w-4" />
                  Currently borrowed by you
                </p>
              </div>
            ) : (
              <Button 
                size="lg" 
                onClick={handleBorrow} 
                disabled={!isAvailable || borrowMutation.isPending}
                className="w-full sm:w-auto min-w-[200px] text-base"
                data-testid="button-borrow"
              >
                {borrowMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : !isAvailable ? (
                  "Out of Stock"
                ) : (
                  "Borrow This Book"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
