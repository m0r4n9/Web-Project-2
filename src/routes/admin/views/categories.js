const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.get("/categories", (req, res) => {
    conn.query("SELECT * FROM categories", (err, categories) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.render("admin/categories/categories", {
            categories,
        });
    });
});

router.get("/categories/add", (req, res) => {
    return res.render("admin/categories/add-category");
});

router.get("/categories/:id", (req, res) => {
    const { id } = req.params;

    conn.query("SELECT * FROM categories WHERE id = ?", [id], (err, category) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.render("admin/categories/category-details", {
            category: category[0],
        });
    });
});

module.exports = router;
