const Router = require("express");

const conn = require("../../config/db");
const requireAuth = require("../../middlewares/requireAuth");
const formatSize = require("../../utils/formatSize");

const router = new Router();

const getItemsFromOrders = (orderId) => {
    return new Promise((resolve, reject) => {
        conn.query(
            `SELECT *
             FROM order_items
             WHERE order_id = ?;`,
            [orderId],
            (err, items) => {
                if (err) {
                    reject(err);
                }
                resolve(items);
            },
        );
    });
};

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

router.get("/orders", requireAuth, (req, res) => {
    const userId = req.session?.userId;

    conn.query("SELECT * FROM orders WHERE user_id = ?", [userId], async (orders_err, orders) => {
        if (orders_err) {
            return res.status(500).json({
                message: orders_err,
            });
        }

        const ordersWithItems = {};
        for (const order of orders) {
            if (order?.id) {
                const items = await getItemsFromOrders(order.id);

                ordersWithItems[order.id] = {
                    date: order.date,
                    status: order.status,
                    items,
                };
            }
        }

        return res.render("orders", {
            orders: ordersWithItems,
            formatSize,
        });
    });
});

module.exports = router;
