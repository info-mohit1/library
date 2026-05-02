import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, borrowsTable } from "@workspace/db";
import { eq, isNull, count } from "drizzle-orm";

const router = Router();

router.get("/users/me", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await clerkClient.users.getUser(userId);

    const [borrowRow] = await db
      .select({ borrow_count: count() })
      .from(borrowsTable)
      .where(eq(borrowsTable.user_id, userId));

    res.json({
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.emailAddresses[0]?.emailAddress || "User",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      image_url: user.imageUrl ?? null,
      borrow_count: borrowRow?.borrow_count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
