const Router = require("express");
const conn = require("../../config/db");
const formatSize = require("../../utils/formatSize");

const router = new Router();

router.get("/cart", (req, res) => {
    const userId = req.session?.userId;

    conn.query(
        `SELECT s.name     AS size_value,
                s.id       AS size_id,
                ci.quantity,
                p.name,
                p.price,
                b.name     AS brand_name,
                color.name AS color_name,
                (SELECT image_path
                 FROM shop.product_images
                 WHERE product_id = p.id
                 ORDER BY s.product_id
                 LIMIT 1)  AS product_image
         FROM carts
                  LEFT JOIN
              shop.cart_items ci ON carts.id = ci.cart_id
                  LEFT JOIN
              shop.sizes s ON s.id = ci.size_id
                  LEFT JOIN
              shop.products p ON p.id = s.product_id
                  LEFT JOIN
              shop.brands b ON b.id = p.brand_id
                  LEFT JOIN
              shop.colors color ON color.id = p.color_id
         WHERE user_id = ?;`,
        [userId],
        (error, result) => {
            if (error) {
                console.log("Error fetch cart list", error);
                return res.status(500).json({
                    message: error,
                });
            } else {
                return res.render("cart", {
                    loggedIn: req.session.loggedIn,
                    product_list: result[0]?.size_id ? result : [],
                    formatSize,
                });
            }
        },
    );
});

module.exports = router;
