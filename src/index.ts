import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import router from "./routes/root";

const app = new Hono();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

app.get("/", (c) => {
  return c.text("Hello there");
});

app.route("/api/v1", router)

export default {
  port: 5000,
  fetch: app.fetch
};