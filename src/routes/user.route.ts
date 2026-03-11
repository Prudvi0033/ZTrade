import { Hono } from "hono";
import { protectRoute } from "../middlewares/auth.middleware";
import { depositUsd, getProfile } from "../controllers/user.controller";

const userRouter = new Hono();

userRouter.use(protectRoute)

userRouter.post("/deposit", depositUsd)
userRouter.get("/profile", getProfile)

export default userRouter