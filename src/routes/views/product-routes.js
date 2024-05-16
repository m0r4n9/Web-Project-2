const Router = require("express");
const connection = require("../../config/db");
const formatSize = require("../../utils/formatSize");
// const requireAuth = require("../../middlewares/requireAuth");

const router = new Router();

router.get("/", (req, res) => {
    connection.query(
        `SELECT p.id,
                p.name,
                p.description,
                p.price,
                p.sex,
                b.name            AS brand_name,
                MIN(i.image_path) AS image
         FROM products p
                  JOIN brands b ON p.brand_id = b.id
                  JOIN product_inventory inv ON p.id = inv.product_id
                  LEFT JOIN product_images i ON p.id = i.product_id
         WHERE inv.quantity > 0
         GROUP BY p.id, p.name, p.description, p.price, p.sex, b.name
         ORDER BY p.id DESC
         LIMIT 5;
        `,
        (err, products) => {
            if (err) {
                console.log(err);
                return res.render("errorServer");
            }

            return res.render("main", { loggedIn: req.session.loggedIn, products });
        },
    );
});

// Вынести такие запросы
const getCategories = () => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM categories", (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const getColors = () => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM colors", (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

router.get("/catalog", (req, res) => {
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
    // TODO: вынести эту логику так как 1 в 1 повторяется в product_api

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

    connection.query(get_products, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            const categories = await getCategories();
            const colors = await getColors();

            return res.render("catalog", {
                products: result,
                categories,
                colors,
                sexChecked: sex,
                loggedIn: req.session.loggedIn,
            });
        }
    });
});

router.get("/product/:id", (req, res) => {
    const { id } = req.params;

    connection.query(
        `SELECT products.*, b.name as brand_name
         FROM products
                  LEFT JOIN shop.brands b on b.id = products.brand_id
         WHERE products.id = ?;`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err,
                });
            } else {
                connection.query("SELECT * FROM product_images WHERE product_id = ?", [id], (err, image_result) => {
                    if (err) {
                        return res.status(500).json({
                            message: `Error when fetch images: ${err}`,
                        });
                    } else {
                        connection.query(
                            `SELECT sizes.*, pi.quantity
                             FROM sizes
                                      LEFT JOIN shop.product_inventory pi on sizes.id = pi.size_id
                             WHERE sizes.product_id = ?
                               AND pi.quantity > 0`,
                            [id],
                            (sizes_err, sizes_res) => {
                                if (!err) {
                                    return res.render("product-details", {
                                        product: result[0],
                                        images: image_result,
                                        sizes: sizes_res,
                                        loggedIn: req.session.loggedIn,
                                        formatSize,
                                    });
                                }
                            },
                        );
                    }
                });
            }
        },
    );
});

module.exports = router;
