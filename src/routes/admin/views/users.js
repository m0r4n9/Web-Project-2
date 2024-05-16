const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.get("/users", (req, res) => {
    conn.query("SELECT * FROM users", (err, users) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.render("admin/users/users", {
            users,
        });
    });
});

router.get("/users/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        // return res.render("")
    }

    conn.query("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        return res.render("admin/users/user-details", {
            user: user[0],
        });
    });
});

module.exports = router;
