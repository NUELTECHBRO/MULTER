const jwt = require("jsonwebtoken");
const User = require("../model/User.js")
const {JWTSECRET} = require("../config/env.js")



const middleware = (req, res, next) => {

    const token = req.cookies.xtp_site;

    if (token) {

        try {

            const decoded = jwt.verify(
                token,
                JWTSECRET
            );

            const isUser = User.findById(decoded.id);
            if (!isUser) {
                res.clearCookie("xtp_site");
                req.user = null;
                return next();

            }

            req.user = decoded;

        } catch (error) {

            console.log("JWT Error:", error.message);

            res.clearCookie("xtp_site");

            req.user = null;
        }
    }

    next();
};

console.log("Middleware 1 connected");

module.exports = middleware;