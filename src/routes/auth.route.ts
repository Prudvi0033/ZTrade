import { Hono } from "hono";
import { loginController, signupController } from "../controllers/auth.controller";

const authRouter = new Hono();

authRouter.post("/sign-up", signupController)
authRouter.post("/login", loginController)

export default authRouter;