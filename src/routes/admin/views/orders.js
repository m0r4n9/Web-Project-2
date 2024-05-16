const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.get("/orders", (req, res) => {
    conn.query(
        `SELECT orders.id, orders.date, SUM(order_items.quantity) AS total_products
         FROM orders
                  LEFT JOIN order_items ON orders.id = order_items.order_id
         GROUP BY orders.id, orders.date`,
        (err, orders) => {
            if (err) {
                return res.status(500).json({
                    message: err,
                });
            }

            return res.render("admin/orders/orders", { orders });
        },
    );
});

router.get("/orders/:id", (req, res) => {
    const { id } = req.params;

    conn.query("SELECT * FROM orders WHERE id = ?", [id], (err, order) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        conn.query("SELECT * FROM order_items WHERE order_id = ?", [order[0].id], (err, items) => {
            if (err) {
                return res.status(500).json({
                    message: err,
                });
            }

            return res.render("admin/orders/orders-details", { order: order[0], items });
        });
    });
});

module.exports = router;
