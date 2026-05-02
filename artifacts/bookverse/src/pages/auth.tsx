import { useState } from "react";
import { useSignIn, useSignUp, useClerk } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  BookOpen, BookMarked, Users, Star, ArrowRight, ArrowLeft,
  Eye, EyeOff, Mail, Lock, User, Phone, Check, Loader2, BookText,
  Atom, FlaskConical, Scroll, Cpu, Globe, KeyRound, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── Shared branding left panel ─────────────────────────────────────────── */
function AuthLeftPanel({ mode }: { mode: "signin" | "signup" }) {
  const features = [
    { icon: <BookMarked className="h-5 w-5 text-[#A3501E]" />, title: "Curated Collection", desc: "Hundreds of handpicked titles across every genre" },
    { icon: <Users className="h-5 w-5 text-[#A3501E]" />, title: "Community of Readers", desc: "Join thousands of passionate book lovers" },
    { icon: <Star className="h-5 w-5 text-[#A3501E]" />, title: "Seamless Borrowing", desc: "Borrow and return books with a single click" },
  ];

  return (
    <div className="hidden lg:flex lg:w-[42%] bg-[#2D241C] flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 25% 75%, #A3501E 0%, transparent 55%), radial-gradient(circle at 80% 20%, #6B3410 0%, transparent 40%)" }} />

      <div className="relative z-10">
        <Link href="/" className="flex items-center gap-2.5 mb-14 w-fit">
          <div className="h-9 w-9 rounded-lg bg-[#A3501E]/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[#A3501E]" />
          </div>
          <span className="font-serif text-2xl font-bold text-[#FAF7F2]">BookVerse</span>
        </Link>

        <h2 className="text-4xl font-serif font-bold text-[#FAF7F2] leading-snug mb-5">
          {mode === "signin"
            ? "Welcome back to your literary sanctuary"
            : "Your story starts here"}
        </h2>
        <p className="text-[#E5DCCF]/70 text-base leading-relaxed">
          {mode === "signin"
            ? "Sign in to access your borrowed books, pick up where you left off, and discover what's new on the shelves."
            : "Create your free account to borrow books, track your reading history, and connect with fellow bibliophiles."}
        </p>
      </div>

      <div className="relative z-10 space-y-5">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#A3501E]/15 flex items-center justify-center shrink-0 border border-[#A3501E]/20">
              {f.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-[#FAF7F2]">{f.title}</p>
              <p className="text-xs text-[#E5DCCF]/55">{f.desc}</p>
            </div>
          </div>
        ))}

        <blockquote className="border-l-2 border-[#A3501E] pl-4 pt-4">
          <p className="text-[#E5DCCF]/75 italic text-sm leading-relaxed">
            "BookVerse transformed how I discover books. It feels like having a world-class library at my fingertips."
          </p>
          <footer className="mt-2 text-[#E5DCCF]/45 text-xs">— Eleanor V., Avid Reader</footer>
        </blockquote>
      </div>
    </div>
  );
}

/* ─── Google SVG ──────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ─── Sign In Page ────────────────────────────────────────────────────────── */
type SignInMode = "login" | "forgot_email" | "forgot_verify" | "forgot_reset";

export function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { authenticateWithRedirect } = useClerk();
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<SignInMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clerkErr = (err: any) =>
    err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Something went wrong. Please try again.";

  /* ── Email + password sign-in ── */
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true); setError("");
    try {
      const result = await signIn!.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        setLocation("/");
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(clerkErr(err));
    } finally {
      setLoading(false);
    }
  }

  /* ── Google OAuth ── */
  async function handleGoogle() {
    if (!isLoaded) return;
    await authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: `${basePath}/sso-callback`,
      redirectUrlComplete: "/",
    });
  }

  /* ── Forgot: send reset email ── */
  async function handleForgotSend(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      await signIn!.create({ identifier: email });
      await signIn!.prepareFirstFactor({ strategy: "reset_password_email_code" } as any);
      setMode("forgot_verify");
      setSuccess("Reset code sent! Check your inbox.");
    } catch (err: any) {
      setError(clerkErr(err));
    } finally {
      setLoading(false);
    }
  }

  /* ── Forgot: verify code + set new password ── */
  async function handleForgotReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    if (newPw.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPw,
      } as any);
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        setLocation("/");
      } else {
        setError("Could not reset password. Please try again.");
      }
    } catch (err: any) {
      setError(clerkErr(err));
    } finally {
      setLoading(false);
    }
  }

  /* ── Decorative mini stats ── */
  const stats = [
    { value: "12+", label: "Books" },
    { value: "3", label: "Genres" },
    { value: "Free", label: "Forever" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* ── Left: dark branded panel ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#2D241C] flex-col relative overflow-hidden">
        {/* background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#A3501E]/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#6B3410]/30 blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>

        {/* decorative book-spine columns */}
        <div className="absolute right-0 top-0 bottom-0 w-24 flex gap-1.5 items-end pb-0 opacity-20 pointer-events-none overflow-hidden">
          {[180, 240, 200, 260, 190, 230].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, backgroundColor: ["#A3501E","#8A4319","#6B3410","#C4622A","#7A3B15","#B55A24"][i] }}
              className="w-5 rounded-t-sm shrink-0 self-end" />
          ))}
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto w-fit">
            <div className="h-10 w-10 rounded-xl bg-[#A3501E]/25 flex items-center justify-center border border-[#A3501E]/30">
              <BookOpen className="h-5 w-5 text-[#A3501E]" />
            </div>
            <span className="font-serif text-2xl font-bold text-[#FAF7F2]">BookVerse</span>
          </Link>

          {/* hero copy */}
          <div className="mt-16 mb-auto">
            <p className="text-[#A3501E] text-sm font-semibold uppercase tracking-widest mb-4">Member Login</p>
            <h2 className="text-5xl font-serif font-bold text-[#FAF7F2] leading-[1.15] mb-6">
              Welcome<br />back,<br /><span className="italic text-[#C4773A]">reader.</span>
            </h2>
            <p className="text-[#E5DCCF]/65 text-base leading-relaxed max-w-xs">
              Your borrowed books, reading history, and curated recommendations are waiting for you.
            </p>
          </div>

          {/* mini stats */}
          <div className="flex gap-6 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-serif font-bold text-[#C4773A]">{s.value}</p>
                <p className="text-xs text-[#E5DCCF]/50 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#A3501E] text-[#A3501E]" />)}
            </div>
            <p className="text-[#E5DCCF]/80 italic text-sm leading-relaxed mb-3">
              "The ambiance of a physical bookstore, beautifully translated to the screen. A joy to use every single day."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#A3501E]/30 flex items-center justify-center text-[#FAF7F2] text-xs font-bold">EV</div>
              <div>
                <p className="text-[#FAF7F2] text-sm font-semibold">Eleanor V.</p>
                <p className="text-[#E5DCCF]/45 text-xs">Avid Reader · Member since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ background: "linear-gradient(135deg, #FAF7F2 0%, #F5EDE0 50%, #FAF7F2 100%)" }}>

        {/* subtle decorative circles */}
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-[#A3501E]/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-[#2D241C]/5 blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-md">

          {/* ─── LOGIN FORM ─── */}
          {mode === "login" && (
            <div className="bg-white rounded-3xl shadow-2xl shadow-[#2D241C]/10 border border-[#E8DDD3] overflow-hidden">
              {/* top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#A3501E] via-[#C4773A] to-[#A3501E]" />

              <div className="p-8 lg:p-10">
                {/* heading */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#A3501E]/10 flex items-center justify-center lg:hidden">
                      <BookOpen className="h-4 w-4 text-[#A3501E]" />
                    </div>
                    <span className="text-xs font-semibold text-[#A3501E] uppercase tracking-widest lg:hidden">BookVerse</span>
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-[#2D241C] leading-tight">
                    Sign in to your<br /><span className="italic text-[#A3501E]">account</span>
                  </h1>
                  <p className="text-[#9E8E83] text-sm mt-2">Welcome back — your library awaits.</p>
                </div>

                {error && (
                  <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-red-400" />
                    {error}
                  </div>
                )}

                {/* Google */}
                <button type="button" onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 border border-[#E0D5CC] bg-[#FDFAF7] hover:bg-[#F5EDE0] rounded-xl py-3 text-sm font-medium text-[#2D241C] transition-all shadow-sm hover:shadow mb-5">
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-[#E8DDD3]" />
                  <span className="text-xs text-[#B8A99A] font-medium px-1">or sign in with email</span>
                  <div className="flex-1 h-px bg-[#E8DDD3]" />
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* email */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="si-email" className="text-[#2D241C] font-semibold text-sm">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A99A]" />
                      <Input id="si-email" type="email" placeholder="jane@example.com" autoComplete="email"
                        value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="pl-10 bg-[#FDFAF7] border-[#E0D5CC] focus-visible:ring-[#A3501E]/25 focus-visible:border-[#A3501E] rounded-xl h-11 text-[#2D241C] placeholder:text-[#C8BAB0]" />
                    </div>
                  </div>

                  {/* password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="si-password" className="text-[#2D241C] font-semibold text-sm">Password</Label>
                      <button type="button" onClick={() => { setMode("forgot_email"); setError(""); setSuccess(""); }}
                        className="text-xs text-[#A3501E] hover:text-[#8A4319] font-medium transition-colors">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A99A]" />
                      <Input id="si-password" type={showPw ? "text" : "password"} placeholder="Your password" autoComplete="current-password"
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                        className="pl-10 pr-10 bg-[#FDFAF7] border-[#E0D5CC] focus-visible:ring-[#A3501E]/25 focus-visible:border-[#A3501E] rounded-xl h-11 text-[#2D241C] placeholder:text-[#C8BAB0]" />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B8A99A] hover:text-[#6B5B4E] transition-colors">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* remember me */}
                  <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                    <div onClick={() => setRemember(!remember)}
                      className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${remember ? "bg-[#A3501E] border-[#A3501E] shadow-sm" : "border-[#D9CEC4] bg-[#FDFAF7] group-hover:border-[#A3501E]/50"}`}>
                      {remember && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm text-[#6B5B4E]">Keep me signed in</span>
                  </label>

                  <Button type="submit" disabled={loading}
                    className="w-full bg-[#A3501E] hover:bg-[#8A4319] active:bg-[#6B3410] text-white rounded-xl font-semibold h-12 text-base shadow-md hover:shadow-lg transition-all mt-2">
                    {loading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                      : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>

                <p className="text-center text-sm text-[#9E8E83] mt-6">
                  New to BookVerse?{" "}
                  <Link href="/sign-up" className="text-[#A3501E] hover:text-[#8A4319] font-semibold transition-colors">
                    Create a free account
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ─── FORGOT — enter email ─── */}
          {mode === "forgot_email" && (
            <div className="bg-white rounded-3xl shadow-2xl shadow-[#2D241C]/10 border border-[#E8DDD3] overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#A3501E] via-[#C4773A] to-[#A3501E]" />
              <div className="p-8 lg:p-10">
                <button type="button" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  className="flex items-center gap-1.5 text-sm text-[#9E8E83] hover:text-[#6B5B4E] mb-6 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to sign in
                </button>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-[#A3501E]/10 flex items-center justify-center mb-4 border border-[#A3501E]/15">
                    <KeyRound className="h-8 w-8 text-[#A3501E]" />
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-[#2D241C]">Reset your password</h1>
                  <p className="text-[#9E8E83] text-sm mt-2 max-w-xs">Enter your email and we'll send a reset code to your inbox.</p>
                </div>
                {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
                <form onSubmit={handleForgotSend} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fp-email" className="text-[#2D241C] font-semibold text-sm">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A99A]" />
                      <Input id="fp-email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="pl-10 bg-[#FDFAF7] border-[#E0D5CC] focus-visible:ring-[#A3501E]/25 focus-visible:border-[#A3501E] rounded-xl h-11 text-[#2D241C]" />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-[#A3501E] hover:bg-[#8A4319] text-white rounded-xl font-semibold h-12 shadow-md">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : <>Send Reset Code <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ─── FORGOT — enter code + new password ─── */}
          {mode === "forgot_verify" && (
            <div className="bg-white rounded-3xl shadow-2xl shadow-[#2D241C]/10 border border-[#E8DDD3] overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#A3501E] via-[#C4773A] to-[#A3501E]" />
              <div className="p-8 lg:p-10">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4 border border-green-200">
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-[#2D241C]">Set new password</h1>
                  <p className="text-[#9E8E83] text-sm mt-2 max-w-xs">
                    We emailed a code to <span className="font-semibold text-[#2D241C]">{email}</span>. Enter it along with your new password.
                  </p>
                </div>
                {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
                {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{success}</div>}
                <form onSubmit={handleForgotReset} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="reset-code" className="text-[#2D241C] font-semibold text-sm text-center">Verification Code</Label>
                    <Input id="reset-code" type="text" inputMode="numeric" maxLength={6} placeholder="••••••"
                      value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="bg-[#FDFAF7] border-[#E0D5CC] focus-visible:ring-[#A3501E]/25 focus-visible:border-[#A3501E] rounded-xl h-14 text-[#2D241C] text-center text-2xl tracking-[0.5em] font-mono" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-pw" className="text-[#2D241C] font-semibold text-sm">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8A99A]" />
                      <Input id="new-pw" type={showNewPw ? "text" : "password"} placeholder="Min. 8 characters"
                        value={newPw} onChange={(e) => setNewPw(e.target.value)}
                        className="pl-10 pr-10 bg-[#FDFAF7] border-[#E0D5CC] focus-visible:ring-[#A3501E]/25 focus-visible:border-[#A3501E] rounded-xl h-11 text-[#2D241C]" />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B8A99A] hover:text-[#6B5B4E]">
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-[#A3501E] hover:bg-[#8A4319] text-white rounded-xl font-semibold h-12 shadow-md">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Reset Password & Sign In"}
                  </Button>
                  <p className="text-center text-xs text-[#9E8E83]">
                    Didn't get the code?{" "}
                    <button type="button" onClick={() => handleForgotSend({ preventDefault: () => {} } as any)}
                      className="text-[#A3501E] hover:text-[#8A4319] font-medium">
                      Resend
                    </button>
                  </p>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── Custom Sign Up Page ─────────────────────────────────────────────────── */
const GENRES = [
  { id: "Fiction", label: "Fiction & Stories", icon: <BookText className="h-4 w-4" /> },
  { id: "Tech", label: "Technology", icon: <Cpu className="h-4 w-4" /> },
  { id: "Science", label: "Science", icon: <Atom className="h-4 w-4" /> },
  { id: "History", label: "History", icon: <Scroll className="h-4 w-4" /> },
  { id: "Biography", label: "Biography", icon: <User className="h-4 w-4" /> },
  { id: "Philosophy", label: "Philosophy", icon: <Globe className="h-4 w-4" /> },
  { id: "Self-Help", label: "Self-Help", icon: <Star className="h-4 w-4" /> },
  { id: "Science Fiction", label: "Sci-Fi", icon: <FlaskConical className="h-4 w-4" /> },
];

type Step = "info" | "interests" | "verify";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  interests: string[];
  agreedToTerms: boolean;
}

const EMPTY_FORM: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  password: "", confirmPassword: "", interests: [], agreedToTerms: false,
};

function StepDot({ n, current }: { n: number; current: number }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
      done ? "bg-[#A3501E] border-[#A3501E] text-white" :
      active ? "bg-white border-[#A3501E] text-[#A3501E]" :
      "bg-transparent border-[#D9CEC4] text-[#9E8E83]"
    }`}>
      {done ? <Check className="h-4 w-4" /> : n}
    </div>
  );
}

function ProgressSteps({ step }: { step: Step }) {
  const n = step === "info" ? 1 : step === "interests" ? 2 : 3;
  const labels = ["Personal Info", "Reading Taste", "Verify Email"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-0">
          <div className="flex flex-col items-center">
            <StepDot n={i} current={n} />
            <span className={`text-[10px] mt-1 font-medium tracking-wide ${i === n ? "text-[#A3501E]" : "text-[#9E8E83]"}`}>
              {labels[i - 1]}
            </span>
          </div>
          {i < 3 && (
            <div className={`h-px w-10 mx-1 mb-4 transition-colors ${n > i ? "bg-[#A3501E]" : "bg-[#D9CEC4]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function FormField({
  label, id, type = "text", placeholder, value, onChange, icon, rightEl, error,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  icon?: React.ReactNode; rightEl?: React.ReactNode; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[#2D241C] font-medium text-sm">{label}</Label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E8E83]">{icon}</span>}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-white border-[#D9CEC4] focus-visible:ring-[#A3501E]/30 focus-visible:border-[#A3501E] rounded-lg text-[#2D241C] placeholder:text-[#B8A99A] ${icon ? "pl-9" : ""} ${rightEl ? "pr-10" : ""} ${error ? "border-red-400" : ""}`}
        />
        {rightEl && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</span>}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

export function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { authenticateWithRedirect } = useClerk();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "otp" | "general", string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormData) => (v: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleInterest = (id: string) => {
    set("interests")(form.interests.includes(id)
      ? form.interests.filter((x) => x !== id)
      : [...form.interests, id]);
  };

  /* ── Validation ── */
  function validateInfo(): boolean {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!form.agreedToTerms) e.agreedToTerms = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Step 1 → 2 ── */
  function handleInfoNext(e: React.FormEvent) {
    e.preventDefault();
    if (validateInfo()) setStep("interests");
  }

  /* ── Step 2 → submit to Clerk ── */
  async function handleInterestsNext(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setErrors({});
    try {
      await signUp!.create({
        firstName: form.firstName,
        lastName: form.lastName,
        emailAddress: form.email,
        password: form.password,
        unsafeMetadata: {
          phone: form.phone || undefined,
          interests: form.interests,
        },
      });
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Registration failed. Please try again.";
      setErrors({ general: msg });
      setStep("info");
    } finally {
      setLoading(false);
    }
  }

  /* ── Step 3 — verify OTP ── */
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    if (otp.length < 4) { setErrors({ otp: "Enter the code from your email" }); return; }
    setLoading(true);
    setErrors({});
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code: otp });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        setLocation("/");
      } else {
        setErrors({ otp: "Verification incomplete. Please try again." });
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || "Invalid code. Please try again.";
      setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  }

  /* ── Google OAuth ── */
  async function handleGoogle() {
    if (!isLoaded) return;
    await authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: `${basePath}/sso-callback`,
      redirectUrlComplete: "/",
      // @ts-ignore
      signUpUnsafeMetadata: { interests: form.interests },
    });
  }

  /* ── Resend OTP ── */
  async function handleResend() {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <AuthLeftPanel mode="signup" />

      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-[#FAF7F2] overflow-y-auto">
        <div className="w-full max-w-lg">

          <ProgressSteps step={step} />

          {/* ── STEP 1: Personal Info ── */}
          {step === "info" && (
            <form onSubmit={handleInfoNext} className="space-y-5">
              <div className="mb-2">
                <h1 className="text-2xl font-serif font-bold text-[#2D241C]">Create your account</h1>
                <p className="text-[#6B5B4E] text-sm mt-1">Tell us a bit about yourself to get started</p>
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {errors.general}
                </div>
              )}

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border border-[#D9CEC4] bg-white hover:bg-[#F0EBE4] rounded-lg py-2.5 text-sm font-medium text-[#2D241C] transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#D9CEC4]" />
                <span className="text-xs text-[#9E8E83] font-medium">or fill in the form</span>
                <div className="flex-1 h-px bg-[#D9CEC4]" />
              </div>

              <FieldRow>
                <FormField label="First Name" id="firstName" placeholder="Jane" icon={<User className="h-4 w-4" />}
                  value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
                <FormField label="Last Name" id="lastName" placeholder="Austen" icon={<User className="h-4 w-4" />}
                  value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
              </FieldRow>

              <FormField label="Email Address" id="email" type="email" placeholder="jane@example.com"
                icon={<Mail className="h-4 w-4" />}
                value={form.email} onChange={set("email")} error={errors.email} />

              <FormField label="Phone Number (optional)" id="phone" type="tel" placeholder="+1 (555) 000-0000"
                icon={<Phone className="h-4 w-4" />}
                value={form.phone} onChange={set("phone")} />

              <FormField
                label="Password" id="password" type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                icon={<Lock className="h-4 w-4" />}
                value={form.password} onChange={set("password")} error={errors.password}
                rightEl={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#9E8E83] hover:text-[#2D241C]">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <FormField
                label="Confirm Password" id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                icon={<Lock className="h-4 w-4" />}
                value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword}
                rightEl={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[#9E8E83] hover:text-[#2D241C]">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              {/* Password strength bar */}
              {form.password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1.5">
                    {[...Array(4)].map((_, i) => {
                      const strength = form.password.length >= 12 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password) ? 4
                        : form.password.length >= 10 && /[A-Z]/.test(form.password) ? 3
                        : form.password.length >= 8 ? 2
                        : 1;
                      return <div key={i} className={`flex-1 rounded-full transition-colors ${i < strength ? (strength >= 4 ? "bg-green-500" : strength === 3 ? "bg-yellow-500" : strength === 2 ? "bg-orange-400" : "bg-red-400") : "bg-[#D9CEC4]"}`} />;
                    })}
                  </div>
                  <p className="text-xs text-[#9E8E83]">
                    {form.password.length < 8 ? "Too short" : form.password.length < 10 ? "Fair — try adding numbers" : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? "Strong password" : "Good — add uppercase & numbers"}
                  </p>
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => set("agreedToTerms")(!form.agreedToTerms)}
                  className={`mt-0.5 h-4.5 w-4.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${form.agreedToTerms ? "bg-[#A3501E] border-[#A3501E]" : "border-[#D9CEC4] bg-white"}`}
                >
                  {form.agreedToTerms && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-[#6B5B4E] leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-[#A3501E] hover:underline font-medium">Terms of Service</a> and{" "}
                  <a href="#" className="text-[#A3501E] hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>
              {errors.agreedToTerms && <p className="text-red-500 text-xs -mt-3">{errors.agreedToTerms}</p>}

              <Button type="submit" className="w-full bg-[#A3501E] hover:bg-[#8A4319] text-white rounded-lg font-semibold h-11 shadow-sm">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-sm text-[#6B5B4E]">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-[#A3501E] hover:text-[#8A4319] font-semibold">Sign in</Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: Reading Interests ── */}
          {step === "interests" && (
            <form onSubmit={handleInterestsNext} className="space-y-6">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#2D241C]">What do you love to read?</h1>
                <p className="text-[#6B5B4E] text-sm mt-1">Select all genres that interest you — we'll personalise your experience</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GENRES.map((g) => {
                  const selected = form.interests.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleInterest(g.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? "border-[#A3501E] bg-[#A3501E]/8 text-[#2D241C]"
                          : "border-[#D9CEC4] bg-white text-[#6B5B4E] hover:border-[#A3501E]/40 hover:bg-[#FAF0E8]"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? "bg-[#A3501E]/15 text-[#A3501E]" : "bg-[#F0EBE4] text-[#9E8E83]"}`}>
                        {g.icon}
                      </div>
                      <span className="text-sm font-medium">{g.label}</span>
                      {selected && <Check className="ml-auto h-4 w-4 text-[#A3501E] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[#9E8E83] text-center">
                {form.interests.length === 0
                  ? "Skip this step or select at least one genre"
                  : `${form.interests.length} genre${form.interests.length > 1 ? "s" : ""} selected`}
              </p>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("info")}
                  className="flex-1 border-[#D9CEC4] text-[#6B5B4E] hover:bg-[#F0EBE4] rounded-lg h-11">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" disabled={loading}
                  className="flex-[2] bg-[#A3501E] hover:bg-[#8A4319] text-white rounded-lg font-semibold h-11 shadow-sm">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Email Verification ── */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#A3501E]/10 flex items-center justify-center mb-5">
                  <Mail className="h-8 w-8 text-[#A3501E]" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-[#2D241C]">Check your inbox</h1>
                <p className="text-[#6B5B4E] text-sm mt-2 max-w-sm">
                  We sent a 6-digit verification code to <span className="font-semibold text-[#2D241C]">{form.email}</span>. Enter it below to activate your account.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="otp" className="text-[#2D241C] font-medium text-sm text-center">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={`bg-white border-[#D9CEC4] focus-visible:ring-[#A3501E]/30 focus-visible:border-[#A3501E] rounded-lg text-[#2D241C] text-center text-2xl tracking-[0.4em] h-14 font-mono ${errors.otp ? "border-red-400" : ""}`}
                />
                {errors.otp && <p className="text-red-500 text-xs text-center">{errors.otp}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[#A3501E] hover:bg-[#8A4319] text-white rounded-lg font-semibold h-11 shadow-sm">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : "Verify & Continue"}
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm text-[#6B5B4E]">
                <p>Didn't receive the email?{" "}
                  <button type="button" disabled={loading} onClick={handleResend}
                    className="text-[#A3501E] hover:text-[#8A4319] font-semibold disabled:opacity-50">
                    Resend code
                  </button>
                </p>
                <button type="button" onClick={() => setStep("info")}
                  className="text-[#9E8E83] hover:text-[#6B5B4E] text-xs">
                  ← Use a different email
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
