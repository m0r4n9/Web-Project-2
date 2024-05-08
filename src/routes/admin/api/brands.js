const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.post("/brands", (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            status: "failed",
            message: "Название компании не указано",
        });
    }

    conn.query("SELECT * FROM brands WHERE name = ?", [name], (err_candidate, candidate) => {
        if (err_candidate) {
            return res.status(500).json({
                status: "errro",
                message: err_candidate,
            });
        }

        if (candidate.length) {
            return res.status(400).json({
                status: "errro",
                message: "Компания с таким названием уже существует",
            });
        }

        conn.query("INSERT INTO brands (name) VALUES (?)", [name], (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "errro",
                    message: err,
                });
            }

            return res.json({
                status: "successful",
                insertId: result.insertId,
            });
        });
    });
});

router.delete("/brands/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "ID компании не указан",
        });
    }

    conn.query("DELETE FROM brands WHERE id = ?", [id], (err) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.status(200).json({
            deleted: true,
        });
    });
});

router.put("/brands/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            status: "errro",
            message: "Название компании отсутствует.",
        });
    }

    conn.query("SELECT id FROM brands WHERE id = ?", [id], (err, brand) => {
        if (err) {
            return res.status(500).json({
                status: "errro",
                message: err,
            });
        }

        if (!brand.length) {
            return res.status(400).json({
                status: "failed",
                message: "Компании с таким ID нет.",
            });
        }

        conn.query("UPDATE brands SET name = ? WHERE id = ?", [name, id], (update_err) => {
            if (update_err) {
                return res.status(500).json({
                    status: "errro",
                    message: update_err,
                });
            }

            return res.json({
                status: "successful",
            });
        });
    });
});

module.exports = router;
