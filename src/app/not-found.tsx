import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-20">
      <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-6" />
      <h1 className="text-4xl font-serif font-bold text-foreground mb-2">404</h1>
      <h2 className="text-xl font-medium text-foreground mb-3">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Go back home
        </Button>
      </Link>
    </div>
  );
}
