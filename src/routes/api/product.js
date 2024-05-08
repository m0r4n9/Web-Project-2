const Router = require("express");

const conn = require("../../config/db");

const router = new Router();

router.get("/products", (req, res) => {
    const { categories, colors } = req.query;

    let additionalCondition = "";
    const conditions = [];
    if (categories?.length || categories || colors?.length) {
        additionalCondition = `AND `;

        categories && conditions.push(`c.id IN (${categories.toString()})`);
        colors && conditions.push(`colors.id IN (${colors.toString()})`);

        additionalCondition += conditions.join(" AND ");
    }

    const get_products = `SELECT p.id,
                                 p.name,
                                 p.description,
                                 p.price,
                                 p.sex,
                                 c.name       AS category_name,
                                 colors.name  AS color_name,
                                 b.name       AS brand_name,
                                 i.image_path AS image
                          FROM products p
                                   JOIN brands b ON p.brand_id = b.id
                                   JOIN product_inventory inv ON p.id = inv.product_id
                                   left join shop.categories c on c.id = p.category_id
                                   left join shop.colors colors on colors.id = p.color_id
                                   LEFT JOIN (SELECT product_id, MIN(id) AS min_image_id
                                              FROM product_images
                                              GROUP BY product_id)
                              AS image ON p.id = image.product_id
                                   LEFT JOIN product_images i ON image.min_image_id = i.id
                          WHERE inv.quantity > 0 ${additionalCondition ? additionalCondition : ""}`;

    console.log(get_products.trim());

    conn.query(get_products, [], (err, products) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.json(products);
    });
});

module.exports = router;
