import type { Context } from "hono";
import { db } from "..";
import { accounts, assets } from "../db/schema";
import { and, eq, sql } from "drizzle-orm";

export const depositUsd = async (c: Context) => {
  try {
    const { amount } = await c.req.json();
    const user = c.get("user");

    if (!amount || amount <= 0) {
      return c.json(
        {
          data: "Enter a valid amount",
        },
        400,
      );
    }

    const usdAsset = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, "USD"));

    if (usdAsset.length === 0) {
      return c.json({ msg: "USD asset not initialized" }, 500);
    }

    const usd = usdAsset[0];

    if (!usd) {
      return c.json({ msg: "USD asset not initialized" }, 500);
    }

    const usdId = usd.id;

    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${amount}`,
      })
      .where(and(eq(accounts.user_id, user.id), eq(accounts.asset_id, usdId)));

    return c.json({
      msg: "Deposit successful",
    });
  } catch (error) {
    return c.json({ msg: "Deposit failed" }, 500);
  }
};

export const getProfile = async (c: Context) => {
  try {
    const user = c.get("user");

    const usdAsset = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, "USD"));

    if (usdAsset.length === 0) {
      return c.json({ msg: "USD asset not initialized" }, 500);
    }

    const usd = usdAsset[0];

    if (!usd) {
      return c.json({ msg: "USD asset not initialized" }, 500);
    }

    const usdId = usd.id;

    const balance = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.user_id, user.id), eq(accounts.asset_id, usdId)));

      return c.json({
        user,
        balance: balance[0]?.balance
      })
  } catch (error) {
    return c.json({ msg: "Error fetching profile" }, 500);
  }
};
