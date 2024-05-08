const Router = require("express");

const conn = require("../../../config/db");
const formatSize = require("../../../utils/formatSize");

const router = new Router();

router.get("/size/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: "failed",
            message: "Не указан id size",
        });
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    conn.query(
        `SELECT sizes.*, inventory.quantity
         FROM sizes
                  LEFT JOIN shop.product_inventory inventory on sizes.id = inventory.size_id
         WHERE sizes.id = ?;`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: `Error fetch size: ${result}`,
                });
            }

            return res.json({
                status: "success",
                size: result[0],
            });
        },
    );
});

router.post("/size", (req, res) => {
    const { size, productId } = req.body;

    if (!size || !productId) {
        return res.status(400).json({
            status: "error",
            message: "Не указан размер или ID продукта",
        });
    }

    conn.query(
        "SELECT id FROM sizes WHERE name = ? AND product_id = ?",
        [size, productId],
        (err_fetch, res_fetch) => {
            if (err_fetch) {
                return res.status(500).json({
                    status: "failed",
                    message: `Error when fetch size: ${err_fetch}`,
                });
            }

            if (res_fetch.length) {
                return res.status(400).json({
                    status: "failed",
                    message: "Данный размер уже существует.",
                });
            } else {
                conn.query(
                    "INSERT INTO sizes (name, product_id) VALUES (?, ?)",
                    [size, productId],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({
                                status: "failed",
                                message: `Error when insert size: ${err}`,
                            });
                        }

                        const formatedSize = formatSize(size);

                        return res.json({
                            status: "success",
                            size,
                            formatedSize,
                            sizeId: result.insertId,
                        });
                    },
                );
            }
        },
    );
});

router.delete("/size/:sizeId", (req, res) => {
    const { sizeId } = req.params;

    conn.query("DELETE FROM sizes WHERE id = ?", [sizeId], (err_delete) => {
        if (err_delete) {
            return res.json({
                status: "failed",
                message: "Ошибка при удалении размера",
            });
        }
        return res.json({
            status: "success",
        });
    });
});

router.post("/size/inventory", (req, res) => {
    const { sizeId, quantity } = req.body;

    if (!sizeId || !quantity) {
        return res.status(400).json({
            status: "failed",
            message: "Не указа sizeId или кол-во",
        });
    }

    conn.query("SELECT * FROM sizes WHERE id = ?", [sizeId], (size_err, size_result) => {
        if (size_err) {
            return res.status(500).json({
                status: "error",
                message: `Error when fetch size: ${size_err}`,
            });
        }

        if (!size_result.length) {
            return res.status(400).json({
                status: "failed",
                message: "Размера с таким id не существует",
            });
        }

        conn.query(
            "SELECT * FROM product_inventory WHERE size_id = ?",
            [sizeId],
            (inventory_err, inventory_res) => {
                if (inventory_err) {
                    return res.status(500).json({
                        status: "error",
                        message: `Error when fetch product inventory: ${inventory_err}`,
                    });
                }

                let sql_command = "";
                if (!inventory_res.length) {
                    sql_command = `INSERT INTO product_inventory (product_id, size_id, quantity)
                                   VALUES (${size_result[0].product_id}, ${sizeId}, ${quantity});`;
                } else {
                    sql_command = `UPDATE product_inventory
                                   SET quantity = ${quantity}
                                   WHERE size_id = ${sizeId}; `;
                }

                conn.query(sql_command, (update_err) => {
                    if (update_err) {
                        return res.status(500).json({
                            status: "error",
                            message: `Error when update/insert inventory: ${update_err}`,
                        });
                    }

                    return res.json({
                        status: "success",
                    });
                });
            },
        );
    });
});

module.exports = router;
