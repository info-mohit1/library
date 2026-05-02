import { BookOpen, Github, Twitter, Instagram, Mail } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-[#2D241C] text-[#E5DCCF]">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#A3501E]" />
              <span className="font-serif text-xl font-bold text-[#FAF7F2]">BookVerse</span>
            </Link>
            <p className="max-w-xs text-sm text-[#E5DCCF]/70 leading-relaxed">
              A beautifully curated digital library where book lovers discover, explore, and borrow books from the comfort of their home.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" aria-label="Twitter" className="text-[#E5DCCF]/50 hover:text-[#A3501E] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-[#E5DCCF]/50 hover:text-[#A3501E] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="GitHub" className="text-[#E5DCCF]/50 hover:text-[#A3501E] transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="mailto:hello@bookverse.app" aria-label="Email" className="text-[#E5DCCF]/50 hover:text-[#A3501E] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#FAF7F2]">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/all-books" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">All Books</Link></li>
              <li><Link href="/all-books?category=Story" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">Stories & Fiction</Link></li>
              <li><Link href="/all-books?category=Tech" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">Technology</Link></li>
              <li><Link href="/all-books?category=Science" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">Science</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#FAF7F2]">Account</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/sign-in" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">Sign In</Link></li>
              <li><Link href="/sign-up" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">Register for Free</Link></li>
              <li><Link href="/profile" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">My Profile</Link></li>
              <li><a href="mailto:hello@bookverse.app" className="text-[#E5DCCF]/60 hover:text-[#A3501E] transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E5DCCF]/10 pt-8 md:flex-row text-xs text-[#E5DCCF]/40">
          <p>© {new Date().getFullYear()} BookVerse. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#A3501E] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#A3501E] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#A3501E] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
