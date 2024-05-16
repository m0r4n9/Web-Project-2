const Router = require("express");
const bcrypt = require("bcrypt");

const connection = require("../../config/db");

const router = new Router();

router.post("/auth", (req, res) => {
    const { email, password } = req.body;

    connection.query("SELECT id, password, isAdmin FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0 || !result[0].password) {
            return res.status(400).json({ error: "Пользователь с таким email не найден" });
        }

        bcrypt.compare(password, result[0].password, function (compareError, compareStatus) {
            if (compareError) {
                return res.status(500).json({ error: "Ошибка при сравнеии пароля" });
            }
            if (compareStatus) {
                req.session.loggedIn = true;
                req.session.userId = result[0].id;
                req.session.isAdmin = result[0].isAdmin;

                return res.json({
                    success: true,
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Пароли не совпадают",
                });
            }
        });
    });
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/auth");
});

router.post("/registration", (req, res) => {
    const { username, email, password } = req.body;

    connection.query(
        `SELECT id
         FROM users
         WHERE email = ?`,
        [email],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                return res.status(400).json({ error: "Пользователь с таким email уже существует" });
            }

            bcrypt.hash(password, 10, (hashErr, hashPassword) => {
                if (hashErr) {
                    return res.status(500).json({ error: "Ошибка при хешировании пароля" });
                }

                connection.query(
                    `INSERT INTO users (username, email, password)
                     VALUES (?, ?, ?)`,
                    [username, email, hashPassword],
                    (insertErr) => {
                        if (insertErr) {
                            return res.status(500).json({ error: insertErr.message });
                        }
                        req.session.loggedIn = true;
                        req.session.username = req.body.username;
                        return res.redirect("/profile");
                    },
                );
            });
        },
    );
});

router.put("/profile/update", (req, res) => {
    const { username, email } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(401).json({
            message: "Пользователь не авторизован",
        });
    }

    connection.query(
        "UPDATE users SET username = ?, email = ? WHERE id = ?",
        [username, email, userId],
        (err_update, res_update) => {
            if (err_update) {
                return res.status(500).json({
                    error: true,
                    message: `Error when update field user: ${err_update}`,
                });
            }
            return res.json({
                success: true,
                data: res_update,
            });
        },
    );
});

module.exports = router;
