const Router = require("express");

const conn = require("../../config/db");

const router = new Router();

const addItemToOrder = (orderId, sizeId, quantity) => {
    return new Promise((resolve, reject) => {
        conn.query(
            `SELECT products.name, products.price, sizes.name as size_name
             FROM products
                      LEFT JOIN sizes ON products.id = sizes.product_id
             WHERE sizes.id = ?`,
            [sizeId],
            (err, product) => {
                if (err) reject(err);

                const { name, price, size_name } = product[0];

                conn.query(
                    `INSERT INTO order_items (order_id, size_value, quantity, product_name, product_price)
                     VALUES (?, ?, ?, ?, ?);`,
                    [orderId, size_name, quantity, name, price],
                    (insert_err) => {
                        if (err) reject(insert_err);
                        resolve();
                    },
                );
            },
        );
    });
};

const updateInventoryAfterOrder = async (sizeId, quantity) => {
    const inventory = await new Promise((resolve, reject) => {
        conn.query("SELECT * FROM product_inventory WHERE size_id = ?", [sizeId], (err, inventory) => {
            if (err) {
                reject(err);
            }
            resolve(inventory[0]);
        });
    });

    const newQuantity = inventory.quantity - quantity;

    return new Promise((resolve, reject) => {
        conn.query("UPDATE product_inventory SET quantity = ? WHERE size_id = ?", [newQuantity, sizeId], (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

const processUserItemOrder = async (items, orderId) => {
    await items.map(async (item) => {
        try {
            await addItemToOrder(orderId, item.size_id, item.quantity);
            await updateInventoryAfterOrder(item.size_id, item.quantity);
        } catch (e) {
            console.log("Error:", e);
        }
    });
};

router.post("/order", (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({
            message: "Пользователь не авторизован",
        });
    }

    conn.query("SELECT * FROM carts WHERE user_id = ?", [userId], (err, cart) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: err,
            });
        }

        conn.query(
            `SELECT cart_items.*, s.name
             FROM cart_items
                      LEFT JOIN shop.sizes s on s.id = cart_items.size_id
             WHERE cart_id = ?`,
            [cart[0].id],
            (items_err, items) => {
                if (items_err) {
                    return res.status(500).json({
                        message: items_err,
                    });
                }

                conn.query("INSERT INTO orders (user_id) VALUES (?)", [userId], async (order_err, order) => {
                    if (order_err) {
                        return res.status(500).json({
                            message: order_err,
                        });
                    }

                    const orderId = order.insertId;

                    try {
                        await processUserItemOrder(items, orderId);
                    } catch (e) {
                        return res.status(500).json({
                            message: e,
                        });
                    }

                    conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cart[0].id], (delete_err) => {
                        if (delete_err) {
                            return res.status(500).json({
                                message: delete_err,
                            });
                        }
                        return res.json({
                            complete: true,
                        });
                    });
                });
            },
        );
    });
});

module.exports = router;
