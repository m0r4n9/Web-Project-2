const Router = require("express");

const conn = require("../../config/db");

const router = new Router();

router.get("/products", (req, res) => {
    const { priceLow, priceMax, categories, colors, sex } = req.query;

    const conditions = [];
    let additionalCondition = "";

    if (categories || colors || sex || priceLow || priceMax) {
        additionalCondition = `AND `;

        categories && conditions.push(`c.id IN (${categories.toString()})`);
        colors && conditions.push(`colors.id IN (${colors.toString()})`);

        if (Array.isArray(sex)) {
            conditions.push(`sex IN (${sex.map((sex) => `'${sex}'`)})`);
        } else if (sex) {
            conditions.push(`sex = '${sex}'`);
        }

        if (priceLow || priceMax) {
            conditions.push(`p.price BETWEEN ${priceLow || 0} AND ${priceMax || 100000}`);
        }

        additionalCondition += conditions.join(" AND ");
    }

    const get_products = `SELECT p.id,
                                 p.name,
                                 p.description,
                                 p.price,
                                 p.sex,
                                 c.name            AS category_name,
                                 colors.name       AS color_name,
                                 b.name            AS brand_name,
                                 MIN(i.image_path) AS image
                          FROM products p
                                   JOIN brands b ON p.brand_id = b.id
                                   JOIN product_inventory inv ON p.id = inv.product_id
                                   left join shop.categories c on c.id = p.category_id
                                   left join shop.colors colors on colors.id = p.color_id
                                   LEFT JOIN product_images i ON p.id = i.product_id
                          WHERE inv.quantity > 0 ${additionalCondition ? additionalCondition : ""}
                          GROUP BY p.id, p.name, p.description, p.price, p.sex, b.name;`;

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
