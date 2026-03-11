import type { Context } from "hono";
import { db } from "..";
import { accounts, assets, markets } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const createAsset = async (c: Context) => {
  try {
    const { symbol, name } = await c.req.json();

    if (!symbol || !name) {
      return c.json(
        {
          data: "Enter symbol and name",
        },
        403,
      );
    }

    const asset = await db
      .insert(assets)
      .values({ name: name, symbol: symbol })
      .returning();

    return c.json(
      {
        data: {
          msg: "Asset Created",
          asset,
        },
      },
      200,
    );
  } catch (error) {
    return c.json({ msg: "Error while creating asset" }, 500);
  }
};

export const createMarket = async (c: Context) => {
  try {
    const { base_asset_symbol, quote_asset_symbol } = await c.req.json();

    if (!base_asset_symbol || !quote_asset_symbol) {
      return c.json("Enter base and quote asset symbols");
    }

    const base_asset = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, base_asset_symbol));
    const quote_asset = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, quote_asset_symbol));

    const base = base_asset[0];
    const quote = quote_asset[0];

    if (!base) {
      return c.json("Base asset not found");
    }

    if (!quote) {
      return c.json("Quote asset not found");
    }

    const market = await db.insert(markets).values({
      base_asset_id: base.id,
      quote_asset_id: quote.id,
      symbol: `${base.symbol}-${quote.symbol}`,
    });

    return c.json({
      msg: "Market created",
    });
  } catch (error) {
    return c.json({ msg: "Error while creating asset" }, 500);
  }
};

export const mintAsset = async (c: Context) => {
  try {
    const { symbol, amount } = await c.req.json();
    const user = c.get("user");

    if (!symbol || !amount) {
      return c.json({ msg: "Enter symbol and amount" }, 400);
    }

    const theAsset = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, symbol));

    const asset = theAsset[0];

    if (!asset) {
      return c.json({ msg: "Asset not found" }, 404);
    }

    const accountRes = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.user_id, user.id), eq(accounts.asset_id, asset.id))
      );

    const existingAccount = accountRes[0];

    if (existingAccount) {
      await db
        .update(accounts)
        .set({
          balance: existingAccount.balance + amount,
          updatedAt: new Date(),
        })
        .where(
          and(eq(accounts.user_id, user.id), eq(accounts.asset_id, asset.id))
        );
    } else {
      await db.insert(accounts).values({
        asset_id: asset.id,
        user_id: user.id,
        balance: amount,
        reserved_balance: 0,
        updatedAt: new Date(),
      });
    }

    return c.json({
      msg: "Asset minted successfully",
    });
  } catch (error) {
    return c.json({ msg: "Mint failed" }, 500);
  }
};
