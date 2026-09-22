const jwt = require("jsonwebtoken");

require("dotenv").config();

const middleware = (req, res, next) => {

    const token = req.cookies.xtp_site;

    if (token) {

        try {

            const decoded = jwt.verify(
                token,
                process.env.JWTSECRET
            );

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