import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";

const app = new Hono();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

app.get("/", (c) => {
  return c.text("Hello there");
});

export default {
  port: 5000,
  fetch: app.fetch
};