import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, bio, interests, readingGoal } = body;

    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      unsafeMetadata: {
        displayName: displayName || "",
        bio: bio || "",
        interests: interests || [],
        readingGoal: readingGoal || 2,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save onboarding data", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
