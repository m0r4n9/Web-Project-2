const Router = require("express");
const fs = require("fs");
const path = require("path");
const util = require("util");

const conn = require("../../../config/db");
const upload = require("../../../middlewares/uploadImg");

const brandRoutes = require("./brands");
const categoryRoute = require("./categories");
const productRoutes = require("./product");
const sizeRoutes = require("./size");
const userRoutes = require("./users");

const router = new Router();

router.use(brandRoutes);
router.use(categoryRoute);
router.use(productRoutes);
router.use(sizeRoutes);
router.use(userRoutes);

router.post("/image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const { productId } = req.body;
    const filename = `uploads/${req.file.filename}`;

    conn.query(
        "INSERT INTO product_images (image_path, product_id) VALUES (?, ?);",
        [filename, productId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "success",
                    message: err,
                });
            }
            res.json({ status: "success", filename: filename, imageId: result.insertId });
        },
    );
});

router.delete("/image/:imageId", (req, res) => {
    const { imageId } = req.params;
    const unlinkAsync = util.promisify(fs.unlink);

    conn.query("SELECT * FROM product_images WHERE id = ?", [imageId], (err, image_fetch) => {
        if (err) {
            return res.json({
                status: "failed",
                message: "Не удалось получить данные изображения:" + err,
            });
        }

        const imagePath = image_fetch[0].image_path;
        conn.query("DELETE FROM product_images WHERE id = ?", [imageId], async (err_delete) => {
            if (err_delete) {
                return res.json({
                    status: "failed",
                    message: "Ошибка при удалении",
                });
            }
            await unlinkAsync(path.resolve(process.cwd(), imagePath));
            return res.json({
                status: "success",
            });
        });
    });
});

module.exports = router;
