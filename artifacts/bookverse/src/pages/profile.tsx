import { useUser, useClerk } from "@clerk/react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, BookOpen, Clock, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  useGetMe, 
  useListMyBorrows, 
  useReturnBook,
  getGetMeQueryKey,
  getListMyBorrowsQueryKey,
  getGetBooksStatsQueryKey,
  getListBooksQueryKey
} from "@workspace/api-client-react";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

  const { data: dbUser, isLoading: isDbUserLoading } = useGetMe({
    query: { enabled: isLoaded && !!user, queryKey: getGetMeQueryKey() }
  });

  const { data: borrows, isLoading: isBorrowsLoading } = useListMyBorrows({
    query: { enabled: isLoaded && !!user, queryKey: getListMyBorrowsQueryKey() }
  });

  const returnMutation = useReturnBook({
    mutation: {
      onSuccess: () => {
        toast.success("Book returned successfully!");
        queryClient.invalidateQueries({ queryKey: getListMyBorrowsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBooksStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      },
      onError: (err: any) => {
        toast.error(err?.data?.message || "Failed to return book");
      }
    }
  });

  if (!isLoaded || isDbUserLoading || isBorrowsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeBorrows = borrows?.filter(b => b.returned_at === null) || [];
  const pastBorrows = borrows?.filter(b => b.returned_at !== null) || [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">My Profile</h1>

      <div className="grid md:grid-cols-12 gap-8">
        {/* User Info Card */}
        <div className="md:col-span-4 space-y-6">
          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-sm mb-4">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-serif font-bold">{user?.fullName || dbUser?.name}</h2>
                <p className="text-muted-foreground text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                
                <div className="w-full mt-6 grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{activeBorrows.length}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Currently Reading</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{dbUser?.borrow_count || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Borrows</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => signOut()}
                  data-testid="button-sign-out"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Borrows List */}
        <div className="md:col-span-8 space-y-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Currently Reading
            </h3>
            
            {activeBorrows.length > 0 ? (
              <div className="grid gap-4">
                {activeBorrows.map(borrow => (
                  <Card key={borrow.id} className="overflow-hidden transition-shadow hover:shadow-md border-border/50">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 aspect-[2/3] sm:aspect-auto sm:h-auto bg-muted/30 shrink-0">
                        {borrow.book?.image_url ? (
                          <img src={borrow.book.image_url} alt={borrow.book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <BookOpen className="h-8 w-8 opacity-20" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/book/${borrow.book_id}`} className="hover:text-primary transition-colors">
                            <h4 className="font-serif font-bold text-lg leading-tight">{borrow.book?.title}</h4>
                          </Link>
                          <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full font-medium">
                            {borrow.book?.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium mb-4">{borrow.book?.author}</p>
                        
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Borrowed {format(new Date(borrow.borrowed_at), "MMM d, yyyy")}
                          </p>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => returnMutation.mutate({ id: borrow.id })}
                            disabled={returnMutation.isPending}
                            data-testid={`button-return-${borrow.id}`}
                          >
                            {returnMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Return Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-dashed border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">No active borrows</p>
                  <p className="text-sm text-muted-foreground mb-4">You aren't reading any books right now.</p>
                  <Link href="/all-books">
                    <Button variant="outline" size="sm">Browse Library</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {pastBorrows.length > 0 && (
            <div>
              <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                Reading History
              </h3>
              <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
                <div className="divide-y divide-border/50">
                  {pastBorrows.map(borrow => (
                    <div key={borrow.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-8 bg-muted rounded shrink-0 overflow-hidden shadow-sm">
                          {borrow.book?.image_url && (
                            <img src={borrow.book.image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <Link href={`/book/${borrow.book_id}`} className="font-medium hover:text-primary transition-colors">
                            {borrow.book?.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{borrow.book?.author}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Returned</p>
                        <p>{borrow.returned_at ? format(new Date(borrow.returned_at), "MMM d, yyyy") : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
