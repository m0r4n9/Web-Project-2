const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.get("/brands", (req, res) => {
    conn.query(
        `SELECT b.id, b.name, COUNT(p.brand_id) AS product_count
         FROM brands b
                  LEFT JOIN products p ON b.id = p.brand_id
         GROUP BY b.id, b.name, b.name;
        `,
        (err, brands) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err,
                });
            }

            return res.render("admin/brands/brands", {
                brands,
            });
        },
    );
});

router.get("/brands/add", (req, res) => {
    return res.render("admin/brands/add-brand");
});

router.get("/brands/:id", (req, res) => {
    const { id } = req.params;

    conn.query(
        `SELECT *
                FROM brands
                WHERE id = ?`,
        [id],
        (err, brand) => {
            if (err) {
                return res.status(500).json({
                    status: "errro",
                    message: err,
                });
            }

            return res.render("admin/brands/brand-details", {
                brand: brand[0],
            });
        },
    );
});

module.exports = router;
