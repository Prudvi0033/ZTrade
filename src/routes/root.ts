import { Hono } from "hono";
import authRouter from "./auth.route";

const router = new Hono()

router.route("/auth", authRouter)

export default router