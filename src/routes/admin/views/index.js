const Router = require("express");

const brandViews = require("./brands");
const productViews = require("./products");
const categoryViews = require("./categories");
const usersViews = require("./users");
const ordersViews = require("./orders");

// const isAdmin = require("../../../middlewares/isAdmin");

const router = new Router();

// router.use(isAdmin);

router.use(brandViews);
router.use(productViews);
router.use(categoryViews);
router.use(usersViews);
router.use(ordersViews);

router.get("/", (req, res) => {
    return res.render("admin/main");
});

module.exports = router;
