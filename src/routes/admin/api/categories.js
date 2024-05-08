const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.post("/categories", (req, res) => {
    const { name } = req.body;

    conn.query("SELECT * FROM categories WHERE name = ?", [name], (category_err, category) => {
        if (category_err) {
            return res.status(500).json({
                message: category_err,
            });
        }

        if (category.length) {
            return res.status(400).json({
                message: "Данная категория уже существует",
            });
        }
        conn.query("INSERT INTO categories (name) VALUES (?)", [name], (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err,
                });
            }

            return res.json({
                insertId: result.insertId,
            });
        });
    });
});

router.put("/categories/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
        return res.status(400).json({
            message: "ID категории не указан",
        });
    }

    conn.query("UPDATE categories SET name = ? WHERE id = ?", [name, id], (err) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.json({
            update: true,
        });
    });
});

router.delete("/categories/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "ID категории не указан",
        });
    }

    conn.query("DELETE FROM categories WHERE id = ?", [id], (err) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.json({
            delete: true,
        });
    });
});

module.exports = router;
