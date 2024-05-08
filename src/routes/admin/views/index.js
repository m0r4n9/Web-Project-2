const Router = require("express");

const brandViews = require("./brands");
const productViews = require("./products");
const categoryViews = require("./categories");

const router = new Router();

router.use(brandViews);
router.use(productViews);
router.use(categoryViews);

router.get("/", (req, res) => {
    return res.render("admin/main");
});

module.exports = router;
