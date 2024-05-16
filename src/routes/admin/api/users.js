const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, email, isAdmin } = req.body;

    if (!id) {
        return res.status(400).json({
            message: "ID пользователя не указан",
        });
    }

    const params = [];
    const conditions = [];

    if (username) {
        params.push(username);
        conditions.push("username = ?");
    }

    if (email) {
        params.push(email);
        conditions.push("email = ?");
    }

    if (isAdmin) {
        params.push(isAdmin);
        conditions.push("isAdmin = ?");
    }

    conn.query(`UPDATE users SET ${conditions.join(", ")} WHERE id = ?`, [...params, id], (err) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.json({
            updated: true,
        });
    });
});

router.delete("/users/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "ID пользователя не указан",
        });
    }

    conn.query("DELETE FROM users WHERE id = ?", [id], (err) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.json({
            deleted: true,
        });
    });
});

module.exports = router;
