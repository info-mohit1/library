import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db, borrowsTable } from "@/lib/db";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    const [borrowRow] = await db
      .select({ borrow_count: count() })
      .from(borrowsTable)
      .where(eq(borrowsTable.user_id, userId));

    const meta = (user.unsafeMetadata ?? {}) as {
      displayName?: string;
      bio?: string;
      interests?: string[];
      readingGoal?: number;
      onboardingComplete?: boolean;
    };

    return NextResponse.json({
      id: user.id,
      name:
        meta.displayName ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.emailAddresses[0]?.emailAddress ||
        "User",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      image_url: user.imageUrl ?? null,
      borrow_count: borrowRow?.borrow_count ?? 0,
      bio: meta.bio ?? "",
      interests: meta.interests ?? [],
      readingGoal: meta.readingGoal ?? 2,
      onboardingComplete: meta.onboardingComplete ?? false,
    });
  } catch (err) {
    console.error("Failed to get user", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
