import { Hono } from "hono";
import type { Context } from "hono/jsx";

const app = new Hono()

app.get("/", (c) => {
    return c.text("Hello there")
})

export default {
    port: 5000,
    fetch: app.fetch
}