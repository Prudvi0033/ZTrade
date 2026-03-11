import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
  uniqueIndex
} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});


export const assets = pgTable("assets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  symbol: varchar({ length: 50 }).unique().notNull(),
  name: varchar({ length: 255 }).notNull()
});


export const accounts = pgTable("accounts",{
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),

    asset_id: integer("asset_id")
      .notNull()
      .references(() => assets.id),

    balance: integer().notNull(),

    reserved_balance: integer().notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => ({
    uniqueUserAsset: uniqueIndex("user_asset_idx").on(
      table.user_id,
      table.asset_id
    )
  })
);


export const markets = pgTable("markets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  symbol: varchar({ length: 50 }).notNull().unique(),

  base_asset_id: integer("base_asset_id")
    .notNull()
    .references(() => assets.id),

  quote_asset_id: integer("quote_asset_id")
    .notNull()
    .references(() => assets.id)
});


export const sideEnum = pgEnum("side", ["BUY", "SELL"]);

export const typeEnum = pgEnum("type", ["MARKET", "LIMIT"]);

export const timeInForceEnum = pgEnum("time_in_force", [
  "GTC",
  "IOC",
  "FOK"
]);

export const statusEnum = pgEnum("status", [
  "OPEN",
  "PARTIAL",
  "FILLED",
  "CANCELLED"
]);


export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),

  market_id: integer("market_id")
    .notNull()
    .references(() => markets.id),

  side: sideEnum("side").notNull(),

  type: typeEnum("type").default("MARKET").notNull(),

  price: integer(),

  quantity: integer().notNull(),

  remaining_quantity: integer().notNull(),

  time_in_force: timeInForceEnum("time_in_force")
    .default("GTC")
    .notNull(),

  status: statusEnum("status").default("OPEN").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull()
});


export const trades = pgTable("trades", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  market_id: integer("market_id")
    .notNull()
    .references(() => markets.id),

  buy_order_id: integer("buy_order_id")
    .notNull()
    .references(() => orders.id),

  sell_order_id: integer("sell_order_id")
    .notNull()
    .references(() => orders.id),

  price: integer().notNull(),

  quantity: integer().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull()
});