import type { Context, Next } from "hono";

export const isAdmin = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user || user[0].username !== "admin") {
    return c.json({ message: "Admin access required" }, 403);
  }

  await next();
};
