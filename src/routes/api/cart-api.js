const Router = require("express");
const conn = require("../../config/db");

const router = new Router();

const getProductFromCartBySize = (sizeId) => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT * FROM cart_items WHERE size_id = ?", [sizeId], (item_err, item_res) => {
            if (item_err) {
                reject(false);
            } else {
                resolve(item_res[0]);
            }
        });
    });
};

const getInventorySize = (sizeId) => {
    return new Promise((resolve, reject) => {
        conn.query("SELECT * FROM product_inventory WHERE size_id = ?", [sizeId], (err, inventory) => {
            if (err) {
                reject(err);
            } else {
                resolve(inventory[0]);
            }
        });
    });
};

router.post("/add", (req, res) => {
    const { sizeId } = req.body;
    const userId = req.session?.userId;

    conn.query(
        `SELECT *
         FROM carts
         WHERE user_id = ?`,
        [userId],
        async (cart_err, cart_res) => {
            if (cart_err) {
                return res.status(500).json({
                    message: `Error fetch cart user: ${cart_err}`,
                });
            }

            if (cart_res[0]?.id) {
                const existProductCart = await getProductFromCartBySize(sizeId);

                if (existProductCart?.id) {
                    conn.query(
                        `UPDATE cart_items
                         SET quantity = ?
                         WHERE size_id = ?;`,
                        [existProductCart.quantity + 1, sizeId],
                        (update_err) => {
                            if (update_err) {
                                return res.status(500).json({
                                    message: `Error update item in cart: ${update_err}`,
                                });
                            } else {
                                return res.json({
                                    update: true,
                                });
                            }
                        },
                    );
                } else {
                    conn.query(
                        `INSERT INTO cart_items (cart_id, size_id, quantity)
                         VALUES (?, ?, ?)`,
                        [cart_res[0].id, sizeId, 1],
                        (add_err) => {
                            if (add_err) {
                                return res.status(500).json({
                                    message: `Error add item to cart: ${cart_err}`,
                                });
                            }
                            return res.json({
                                success: true,
                            });
                        },
                    );
                }
            }
        },
    );
});

router.delete("/clear", (req, res) => {
    const userId = req.session?.userId;

    conn.query("SELECT * FROM carts WHERE user_id = ?", [userId], (fetch_err, cart_res) => {
        if (fetch_err) {
            return res.status(500).json({
                message: `Error when fetch cart: ${fetch_err}`,
            });
        }

        conn.query("DELETE FROM cart_items WHERE cart_id = ?;", [cart_res[0].id], (items_err) => {
            if (items_err) {
                return res.status(500).json({
                    message: `Error when delete items from cart: ${fetch_err}`,
                });
            }

            return res.json({
                success: true,
            });
        });
    });
});

router.put("/update", async (req, res) => {
    const { type, sizeId } = req.body;
    const userId = req.session?.userId;

    if (!type) {
        return res.status(400).json({
            message: "Не орпделено действие",
        });
    }
    //
    const size = await getProductFromCartBySize(sizeId);

    if (size?.id) {
        conn.query("SELECT * FROM carts WHERE user_id = ?;", [userId], async (cart_err, cart) => {
            if (cart_err) {
                return res.status(500).json({
                    message: `Error when fetch cart: ${cart_err}`,
                });
            }

            const quantity = type === "add" ? size.quantity + 1 : size.quantity - 1;

            if (quantity) {
                const inventory = await getInventorySize(sizeId);

                if (type === "add" && quantity > inventory.quantity) {
                    return res.status(400).json({
                        message: "Достигнуто максимальное кол-во.",
                    });
                }

                conn.query(
                    "UPDATE cart_items SET quantity = ? WHERE size_id = ? AND cart_id = ?",
                    [quantity, sizeId, cart[0].id],
                    (err) => {
                        if (err) {
                            return res.status(500).json({
                                message: `Error when update cart: ${err}`,
                            });
                        }
                        return res.json({
                            quantity,
                        });
                    },
                );
            } else {
                conn.query("DELETE FROM cart_items WHERE size_id = ?", [sizeId], (err) => {
                    if (err) {
                        return res.status(500).json({
                            message: `Error when update cart: ${err}`,
                        });
                    }
                    return res.json({
                        delete: true,
                    });
                });
            }
        });
    }
});

module.exports = router;
