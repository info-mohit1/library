"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Cpu,
  FlaskConical,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INTERESTS = [
  {
    key: "Story",
    label: "Stories & Fiction",
    icon: BookOpen,
    desc: "Novels, short stories, fantasy, thrillers",
    color: "border-amber-400 bg-amber-50 text-amber-900",
    activeColor: "border-amber-500 bg-amber-100 ring-amber-400",
  },
  {
    key: "Tech",
    label: "Technology",
    icon: Cpu,
    desc: "Programming, AI, software engineering",
    color: "border-emerald-400 bg-emerald-50 text-emerald-900",
    activeColor: "border-emerald-500 bg-emerald-100 ring-emerald-400",
  },
  {
    key: "Science",
    label: "Science",
    icon: FlaskConical,
    desc: "Physics, biology, history of science",
    color: "border-blue-400 bg-blue-50 text-blue-900",
    activeColor: "border-blue-500 bg-blue-100 ring-blue-400",
  },
];

const READING_GOALS = [
  { value: 1, label: "1 book/month", desc: "Casual reader" },
  { value: 2, label: "2–3 books/month", desc: "Regular reader" },
  { value: 5, label: "5+ books/month", desc: "Avid reader" },
];

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [displayName, setDisplayName] = useState(user?.fullName || "");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [readingGoal, setReadingGoal] = useState(2);

  const toggleInterest = (key: string) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, interests, readingGoal }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await user?.reload();
      toast.success("Welcome to BookVerse! 📚");
      router.push("/");
    } catch {
      toast.error("Could not save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return displayName.trim().length > 0;
    if (step === 2) return interests.length > 0;
    return true;
  };

  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now →
            </button>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {["Your Profile", "Interests", "Reading Goal"].map((label, i) => (
              <span
                key={label}
                className={cn(
                  "text-xs font-medium transition-colors",
                  step > i + 1
                    ? "text-primary"
                    : step === i + 1
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {step > i + 1 && <Check className="inline h-3 w-3 mr-0.5" />}
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          {/* Step 1 — Profile */}
          {step === 1 && (
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">
                    Welcome to BookVerse!
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Let's personalise your reading experience. This takes less than a minute.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="font-medium">
                    What should we call you? <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="displayName"
                    placeholder="e.g. Alex, Book Lover, The Librarian…"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 focus-visible:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="font-medium">
                    A little about yourself{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="What do you love about reading? Any favourite authors?"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="resize-none focus-visible:ring-primary/30"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/200
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Interests */}
          {step === 2 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  What do you love to read?
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Pick one or more categories. We'll use these to highlight the best books for you.
                </p>
              </div>

              <div className="space-y-3">
                {INTERESTS.map(({ key, label, icon: Icon, desc, color, activeColor }) => {
                  const selected = interests.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleInterest(key)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                        selected
                          ? `${activeColor} ring-2`
                          : `${color} hover:opacity-80`
                      )}
                    >
                      <div className="shrink-0 rounded-lg bg-white/60 p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs opacity-70">{desc}</p>
                      </div>
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selected
                            ? "border-current bg-current"
                            : "border-current bg-transparent"
                        )}
                      >
                        {selected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {interests.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Please select at least one category to continue.
                </p>
              )}
            </div>
          )}

          {/* Step 3 — Reading Goal */}
          {step === 3 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Set your reading goal
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  How many books do you aim to read per month? You can change this later.
                </p>
              </div>

              <div className="space-y-3">
                {READING_GOALS.map(({ value, label, desc }) => {
                  const selected = readingGoal === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReadingGoal(value)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <div className="text-left">
                        <p className="font-semibold text-sm text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selected
                            ? "border-primary bg-primary"
                            : "border-border"
                        )}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl bg-muted/50 border border-border/50 p-4 text-sm text-muted-foreground">
                <strong className="text-foreground">You're all set, {displayName || "reader"}!</strong>
                {" "}Your preferences are saved and you can update them anytime from your profile page.
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between px-8 py-5 bg-muted/20 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="gap-1.5 bg-primary hover:bg-primary/90"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={isSaving}
                className="gap-1.5 bg-primary hover:bg-primary/90 px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    Start Reading <BookOpen className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
