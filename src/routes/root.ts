import { Hono } from "hono";
import authRouter from "./auth.route";
import adminRouter from "./admin.route";
import userRouter from "./user.route";

const router = new Hono()

router.route("/auth", authRouter)
router.route("admin", adminRouter)
router.route("/user", userRouter)

export default router