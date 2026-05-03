"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { type Book } from "@/components/book-card";

interface DbUser {
  id: string;
  name: string;
  email: string;
  image_url: string | null;
  borrow_count: number;
}

interface Borrow {
  id: number;
  book_id: number;
  user_id: string;
  borrowed_at: string;
  returned_at: string | null;
  book: Book | null;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [isDbUserLoading, setIsDbUserLoading] = useState(true);
  const [isBorrowsLoading, setIsBorrowsLoading] = useState(true);
  const [returningId, setReturningId] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const fetchData = () => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((u: DbUser) => {
        setDbUser(u);
        setIsDbUserLoading(false);
      })
      .catch(() => setIsDbUserLoading(false));

    fetch("/api/borrows")
      .then((r) => r.json())
      .then((b: Borrow[]) => {
        setBorrows(b);
        setIsBorrowsLoading(false);
      })
      .catch(() => setIsBorrowsLoading(false));
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user]);

  const handleReturn = async (borrowId: number) => {
    setReturningId(borrowId);
    try {
      const res = await fetch(`/api/borrows/${borrowId}/return`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to return");
      toast.success("Book returned successfully!");
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to return book");
    } finally {
      setReturningId(null);
    }
  };

  if (!isLoaded || isDbUserLoading || isBorrowsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeBorrows = borrows.filter((b) => b.returned_at === null);
  const pastBorrows = borrows.filter((b) => b.returned_at !== null);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
        My Profile
      </h1>

      <div className="grid md:grid-cols-12 gap-8">
        {/* User Info Card */}
        <div className="md:col-span-4 space-y-6">
          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-sm mb-4">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-serif font-bold">
                  {user?.fullName || dbUser?.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>

                <div className="w-full mt-6 grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {activeBorrows.length}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Reading Now
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {dbUser?.borrow_count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Total Borrows
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => signOut({ redirectUrl: "/" })}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Borrows List */}
        <div className="md:col-span-8 space-y-8">
          {/* Active Borrows */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Currently Reading
            </h3>

            {activeBorrows.length > 0 ? (
              <div className="grid gap-4">
                {activeBorrows.map((borrow) => (
                  <Card
                    key={borrow.id}
                    className="overflow-hidden transition-shadow hover:shadow-md border-border/50"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-28 aspect-[2/3] sm:aspect-auto sm:h-auto bg-muted/30 shrink-0">
                        {borrow.book?.image_url &&
                        !imgErrors.has(borrow.id) ? (
                          <img
                            src={borrow.book.image_url}
                            alt={borrow.book.title}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setImgErrors((prev) =>
                                new Set([...prev, borrow.id])
                              )
                            }
                          />
                        ) : (
                          <div className="w-full h-full min-h-[100px] bg-gradient-to-br from-[#2D241C] to-[#A3501E]/60 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row flex-1 gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-base line-clamp-1">
                            {borrow.book?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {borrow.book?.author}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            Borrowed{" "}
                            {format(
                              new Date(borrow.borrowed_at),
                              "MMMM d, yyyy"
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            className="mt-2 bg-primary/10 text-primary border-primary/20 text-xs"
                          >
                            Active
                          </Badge>
                        </div>
                        <div className="shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturn(borrow.id)}
                            disabled={returningId === borrow.id}
                            className="border-primary/30 text-primary hover:bg-primary/5"
                          >
                            {returningId === borrow.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Return"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-xl border border-border/40">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">
                  You don't have any active borrows.
                </p>
                <Link href="/all-books">
                  <Button variant="link" className="text-primary mt-1">
                    Browse the library
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Past Borrows */}
          {pastBorrows.length > 0 && (
            <div>
              <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Reading History
              </h3>
              <div className="grid gap-3">
                {pastBorrows.map((borrow) => (
                  <Card
                    key={borrow.id}
                    className="border-border/40 opacity-75"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-12 bg-muted/50 rounded shrink-0 overflow-hidden">
                          {borrow.book?.image_url && !imgErrors.has(borrow.id) ? (
                            <img
                              src={borrow.book.image_url}
                              alt={borrow.book.title}
                              className="w-full h-full object-cover"
                              onError={() =>
                                setImgErrors((prev) =>
                                  new Set([...prev, borrow.id])
                                )
                              }
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {borrow.book?.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {borrow.book?.author}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground shrink-0">
                          <p>
                            Returned{" "}
                            {format(
                              new Date(borrow.returned_at!),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
