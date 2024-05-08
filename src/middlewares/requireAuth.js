const authMiddleware = (req, res, next) => {
    if (req.session && req.session.loggedIn) {
        next();
    } else {
        res.redirect("/auth");
    }
};

module.exports = authMiddleware;
