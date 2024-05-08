const Router = require("express");

const conn = require("../../../config/db");

const router = new Router();

router.post("/product", (req, res) => {
    const { name, description, price, sex, brandId, categoryId, colorId } = req.body;

    conn.query(
        `INSERT INTO products (name, description, category_id, price, color_id, sex, brand_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description, categoryId, price, colorId, sex, brandId],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: err,
                });
            }
            return res.json({
                status: "successful",
                insertId: result.insertId,
            });
        },
    );
});

router.put("/product", (req, res) => {
    const { name, description, price, color_id, sex, brand_id, productId } = req.body;
    const updateFields = {};
    const updateParams = [];

    if (name) {
        updateFields.name = name;
        updateParams.push(name);
    }
    if (description) {
        updateFields.description = description;
        updateParams.push(description);
    }
    if (price) {
        updateFields.price = price;
        updateParams.push(price);
    }
    if (color_id) {
        updateFields.color_id = color_id;
        updateParams.push(color_id);
    }
    if (sex) {
        updateFields.sex = sex;
        updateParams.push(sex);
    }
    if (brand_id) {
        updateFields.brand_id = brand_id;
        updateParams.push(brand_id);
    }

    updateParams.push(productId);

    const updateQuery = `UPDATE products SET ${Object.keys(updateFields)
        .map((field) => `${field} = ?`)
        .join(", ")} WHERE id = ?`;

    conn.query(updateQuery, [...Object.values(updateFields), productId], (error) => {
        if (error) {
            console.log(error);
            return res.status(500).json({
                error: "Error updating product",
            });
        }
        return res.json({
            message: "Product updated successfully",
        });
    });
});

// router.put("/product", (req, res) => {
//     const { name, description, price, color_id, sex, brand_id, productId } = req.body;
//
//     conn.query(
//         `UPDATE products
//          SET name        = ?,
//              description = ?,
//              price       = ?,
//              color_id    = ?,
//              sex         = ?,
//              brand_id    = ?
//          WHERE id = ?`,
//         [name, description, price, color_id, sex, brand_id, productId],
//         (error) => {
//             if (error) {
//                 return res.status(500).json({
//                     error: "Error updating product",
//                 });
//             }
//             return res.json({
//                 message: "Product updated successfully",
//             });
//         },
//     );
// });

router.delete("/product/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "Product ID is undefined",
        });
    }

    // TODO: расскоментить потом.
    // conn.query("DELETE FROM products WHERE id = ?", [id], (err) => {
    //     if (err) {
    //         return res.status(500).json({
    //             status: "error",
    //             message: `Error when delete product: ${err}`,
    //         });
    //     }
    //     return res.json({
    //         status: "success",
    //     });
    // });
});

module.exports = router;
