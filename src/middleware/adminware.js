const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminware = (req, res, next) => {
    const token = req.cookies.emma_app;

    if (!token) {
        req.admin = false;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);

        if (decoded.email === "udeh99701@gmail.com" || decoded.email === "chinemee@gmail.com") {
            req.admin = true;
        } else {
            req.admin = false;
        }

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            console.log("JWT token expired");

            res.clearCookie("emma_app");
            req.admin = false;

            return next();
        }

        console.log("Invalid JWT:", error.message);

        res.clearCookie("emma_app");
        req.admin = false;

        return next();
    }
};

console.log("Middleware 2 reached");

module.exports = adminware;