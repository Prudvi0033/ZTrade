import { Hono } from "hono";
import { protectRoute } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { createAsset, createMarket, mintAsset } from "../controllers/admin.controller";

const adminRouter = new Hono()

adminRouter.use(protectRoute)
adminRouter.use(isAdmin)

adminRouter.post("/assets", createAsset)
adminRouter.post("/markets", createMarket)
adminRouter.post("/mint", mintAsset)

export default adminRouter