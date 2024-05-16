const Router = require("express");
const path = require("path");

const userApi = require("./api/user-api");
const cartApi = require("./api/cart-api");

const userRoutes = require("./views/user-routes");

const productRoutes = require("./views/product-routes");
const productApi = require("./api/product");

const cartRoutes = require("./views/cart-routes");

const orderApi = require("./api/order");

const adminRoutes = require("./admin/views");
const adminApi = require("./admin/api");

const router = new Router();

// Views Routes
router.use(userRoutes);
router.use(productRoutes);
router.use(cartRoutes);

// API Routes
router.use("/api", userApi);
router.use("/api", productApi);
router.use("/api/cart", cartApi);
router.use("/api", orderApi);
router.use("/api/admin", adminApi);

// Admin routes
router.use("/admin", adminRoutes);

router.use((req, res) => {
    res.status(404);
    return res.sendFile(path.join(__dirname, "../public/templates/NotFoundPage.html"));
});

module.exports = router;
