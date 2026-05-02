import { useState } from "react";
import { Link } from "wouter";
import { Book } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
}

const CATEGORY_COLORS: Record<string, string> = {
  Story: "bg-amber-900/20 text-amber-900",
  Tech: "bg-emerald-900/20 text-emerald-900",
  Science: "bg-blue-900/20 text-blue-900",
};

export function BookCard({ book }: BookCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card group border-border/50">
      <div className="relative aspect-[2/3] overflow-hidden bg-muted/30">
        {book.image_url && !imgError ? (
          <img
            src={book.image_url}
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-[#2D241C] to-[#A3501E]/60 text-[#FAF7F2] px-4 py-6 gap-3">
            <BookOpen className="h-10 w-10 opacity-40" />
            <p className="text-center font-serif font-bold text-sm leading-snug opacity-80 line-clamp-3">
              {book.title}
            </p>
            <p className="text-xs opacity-50 text-center">{book.author}</p>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className={`text-xs font-medium backdrop-blur-sm ${
              CATEGORY_COLORS[book.category] ?? "bg-background/80"
            }`}
          >
            {book.category}
          </Badge>
        </div>
      </div>
      <CardContent className="flex-1 p-4 flex flex-col gap-1">
        <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium">{book.author}</p>
        <div className="mt-auto pt-4 flex items-center justify-between text-xs">
          <span
            className={`${
              book.available_quantity > 0 ? "text-secondary" : "text-destructive"
            } font-medium`}
          >
            {book.available_quantity > 0
              ? `${book.available_quantity} Available`
              : "Out of stock"}
          </span>
          <span className="text-muted-foreground">{book.borrow_count} borrows</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/book/${book.id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full font-medium"
            data-testid={`button-details-${book.id}`}
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
