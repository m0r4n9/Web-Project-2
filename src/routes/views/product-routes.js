const Router = require("express");
const connection = require("../../config/db");
const formatSize = require("../../utils/formatSize");
// const requireAuth = require("../../middlewares/requireAuth");

const router = new Router();

router.get("/", (req, res) => {
    return res.render("main", { loggedIn: req.session.loggedIn });
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
    connection.query(
        `SELECT p.id,
                p.name,
                p.description,
                p.price,
                p.sex,
                b.name       AS brand_name,
                i.image_path AS image
         FROM products p
                  JOIN brands b ON p.brand_id = b.id
                  JOIN product_inventory inv ON p.id = inv.product_id
                  LEFT JOIN (SELECT product_id, MIN(id) AS min_image_id
                             FROM product_images
                             GROUP BY product_id)
             AS image ON p.id = image.product_id
                  LEFT JOIN product_images i ON image.min_image_id = i.id
         WHERE inv.quantity > 0;`,
        async (err, result) => {
            if (err) {
                console.log(err);
            } else {
                const categories = await getCategories();
                const colors = await getColors();

                return res.render("catalog", {
                    products: result,
                    categories,
                    colors,
                    loggedIn: req.session.loggedIn,
                });
            }
        },
    );
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
                                    console.log(sizes_res);
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
