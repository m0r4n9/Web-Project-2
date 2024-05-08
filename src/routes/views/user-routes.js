const Router = require("express");
const conn = require("../../config/db");
const requireAuth = require("../../middlewares/requireAuth");

const router = new Router();

router.get("/auth", (req, res) => {
    return res.render("auth");
});

router.get("/profile", requireAuth, (req, res) => {
    const userId = req.session?.userId;

    conn.query(
        `SELECT id, username, email, registration_date
         FROM users
         WHERE id = ?`,
        [userId],
        (user_err, user) => {
            if (user_err) {
                return res.render("profile", {
                    error: true,
                    message: user_err,
                });
            }

            return res.render("profile", {
                user: user[0],
                loggedIn: Boolean(userId),
            });
        },
    );
});

module.exports = router;
