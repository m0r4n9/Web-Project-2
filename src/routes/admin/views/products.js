const Router = require("express");
const conn = require("../../../config/db");
const formatSize = require("../../../utils/formatSize");

const router = new Router();

const getSizesProductById = (id) => {
    return new Promise((resolve, reject) => {
        conn.query(
            `
                SELECT sizes.*, inventory.quantity as size_quantity
                FROM sizes
                         left join shop.product_inventory inventory on sizes.id = inventory.size_id
                WHERE sizes.product_id = ?;
            `,
            [id],
            (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            },
        );
    });
};

const getImagesProductById = (id) => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT * FROM product_images WHERE product_id = ?", [id], (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
};

const getBrands = () => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT * FROM brands", (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
};

const getColors = () => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT * FROM colors", (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT * FROM categories", (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
};

router.get("/products", (req, res) => {
    const { brandId } = req.query;

    const sql_command = `SELECT products.*, c.name as category_name
                         FROM products
                                  LEFT JOIN shop.categories c on c.id = products.category_id
                             ${brandId ? `WHERE products.brand_id = ${brandId}` : ""}`;

    conn.query(sql_command, (err, products) => {
        return res.render("admin/products/products", {
            products,
        });
    });
});

router.get("/product/add", async (req, res) => {
    const brands = await getBrands();
    const colors = await getColors();
    const categories = await getCategories();

    return res.render("admin/products/add-product", {
        brands,
        colors,
        categories,
    });
});

router.get("/product/:id", (req, res) => {
    const { id } = req.params;

    conn.query(
        `select p.*, c.id as color_id, b.id as brand_id, category.name as category_name
         from products as p
                  left join shop.colors c on c.id = p.color_id
                  left join shop.brands b on b.id = p.brand_id
                  left join shop.categories category on category.id = p.category_id
         where p.id = ?;`,
        [id],
        async (err, product) => {
            if (err) {
                return res.status(500).send("Произошла ошибка при обработке запроса. Повторите попытку позже");
            }

            const sizes = await getSizesProductById(id);
            const images = await getImagesProductById(id);
            const brands = await getBrands();
            const colors = await getColors();
            const categories = await getCategories();

            return res.render("admin/products/product-details", {
                product: product[0],
                sizes: sizes.sort((a, b) => a.name - b.name),
                brands,
                categories,
                images,
                colors,
                formatSize,
            });
        },
    );
});

module.exports = router;
