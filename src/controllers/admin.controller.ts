import type { Context } from "hono"
import { db } from ".."
import { assets } from "../db/schema"

export const createAsset = async (c: Context) => {
    try {
        const {symbol, name} = await c.req.json()

        if(!symbol || !name){
            return c.json({
                data: "Enter symbol and name"
            }, 403)
        }

        const asset = await db.insert(assets).values({name: name, symbol: symbol}).returning();

        return c.json({
            data: {
                msg: "Asset Created",
                asset
            }
        }, 200)
    } catch (error) {
        return c.json({ msg: "Error while creating asset" }, 500);
    }
}