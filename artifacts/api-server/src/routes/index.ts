import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";
import bannersRouter from "./banners.js";
import offersRouter from "./offers.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";
import ordersRouter from "./orders.js";
import paymentsRouter from "./payments.js";
import addressesRouter from "./addresses.js";
import usersRouter from "./users.js";
import seedRouter from "./seed.js";
import reviewsRouter from "./reviews.js";
import couponsRouter from "./coupons.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/banners", bannersRouter);
router.use("/offers", offersRouter);
router.use("/cart", cartRouter);
router.use("/wishlist", wishlistRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/addresses", addressesRouter);
router.use("/users", usersRouter);
router.use("/reviews", reviewsRouter);
router.use("/coupons", couponsRouter);
router.use("/admin", adminRouter);
router.use("/seed", seedRouter);

export default router;
