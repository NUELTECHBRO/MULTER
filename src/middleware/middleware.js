const jwt = require("jsonwebtoken");

require("dotenv").config();

const middleware = (req, res, next) => {

    const token = req.cookies.emma_app;

    if (token) {

        try {

            const decoded = jwt.verify(
                token,
                process.env.JWTSECRET
            );

            req.user = decoded;

        } catch (error) {

            console.log("JWT Error:", error.message);

            res.clearCookie("emma_app");

            req.user = null;
        }
    }

    next();
};

console.log("Middleware 1 connected");

module.exports = middleware;