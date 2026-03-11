import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { db } from "..";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const protectRoute = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { userId: number };

    const user = await db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (user.length === 0) {
      return c.json({ message: "User not found" }, 404);
    }

    c.set("user", user[0]);

    await next();

  } catch (error) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};