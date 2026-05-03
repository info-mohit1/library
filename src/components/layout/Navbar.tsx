"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function Navbar() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-foreground">
              BookVerse
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/all-books"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              All Books
            </Link>
            {isSignedIn && (
              <Link
                href="/profile"
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                My Profile
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full ring-offset-background transition-all hover:bg-muted p-1 pr-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline-block max-w-[100px] truncate">
                    {user.firstName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.fullName && (
                      <p className="font-medium">{user.fullName}</p>
                    )}
                    {user.primaryEmailAddress && (
                      <p className="w-[150px] truncate text-sm text-muted-foreground">
                        {user.primaryEmailAddress.emailAddress}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => signOut({ redirectUrl: "/" })}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/sign-in">
                <Button size="sm" variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  variant="default"
                  className="rounded-full px-5 font-medium shadow-sm transition-all hover:shadow-md"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          <Link
            href="/"
            className="block text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/all-books"
            className="block text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            All Books
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/profile"
                className="block text-sm font-medium text-foreground/80 hover:text-primary py-2 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                My Profile
              </Link>
              <button
                className="block w-full text-left text-sm font-medium text-destructive py-2"
                onClick={() => {
                  signOut({ redirectUrl: "/" });
                  setMobileOpen(false);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/sign-in" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/sign-up" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
