function isAdmin(req, res, next) {
    if (req.session.userId && req.session.isAdmin) {
        next();
    } else {
        res.redirect("/auth");
    }
}

module.exports = isAdmin;
