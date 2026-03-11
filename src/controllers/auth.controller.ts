import type { Context } from "hono";
import { db } from "..";
import { accounts, assets, users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "3d" });
};

export const loginController = async (c: Context) => {
  try {
    let { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ msg: "All fields are required" }, 400);
    }

    username = username.toLowerCase().trim();

    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (user.length === 0) {
      return c.json({ msg: "Invalid credentials" }, 401);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user[0]?.password as string,
    );

    if (!isPasswordValid) {
      return c.json({ msg: "Invalid credentials" }, 401);
    }

    const token = generateToken(user[0]?.id as number);

    return c.json({
      msg: "Login successful",
      token,
    });
  } catch (error) {
    return c.json({ msg: "Login failed" }, 500);
  }
};

export const signupController = async (c: Context) => {
  try {
    let { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ msg: "All fields are required" }, 400);
    }

    username = username.toLowerCase().trim();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUser.length > 0) {
      return c.json({ msg: "Username already exists" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning();

    const createdUser = newUser[0];

    if (!createdUser) {
      return c.json({ msg: "Error creating user" }, 500);
    }

    const usdAsset = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, "USD"));

    const usd = usdAsset[0];

    if (!usd) {
      return c.json({ msg: "USD asset not initialized" }, 500);
    }

    await db.insert(accounts).values({
      user_id: createdUser.id,
      asset_id: usd.id,
      balance: 10000,
      reserved_balance: 0,
    });

    const token = generateToken(newUser[0]?.id as number);

    return c.json({
      msg: "User created",
      token,
    });
  } catch (error) {
    return c.json({ msg: "Signup failed" }, 500);
  }
};
