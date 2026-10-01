const jwt = require("jsonwebtoken");

const genToken =  (id,name,email)=>{
    const token = jwt.sign({
                id,
                name,
                email,
            },
            process.env.JWTSECRET, {
                expiresIn: "1d"
            }
        );
        return token;
}
module.exports = genToken;