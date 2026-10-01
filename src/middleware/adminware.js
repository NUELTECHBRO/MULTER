const jwt = require("jsonwebtoken");
const adminEmails = require("../config/adminEmails.js");
require("dotenv").config();

const adminware = (req, res, next) => {
    const token = req.cookies.xtp_site;

    if (!token) {
        req.admin = false;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);

        if (adminEmails.includes(decoded.email)) {
            req.admin = true;
        } else {
            req.admin = false;
        }

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            console.log("JWT token expired");

            res.clearCookie("xtp_site");
            req.admin = false;

            return next();
        }

        console.log("Invalid JWT:", error.message);

        res.clearCookie("xtp_site");
        req.admin = false;

        return next();
    }
};

console.log("Middleware 2 reached");

module.exports = adminware;