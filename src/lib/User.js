const User = require("../model/User.js");

const genUser = async (name, email, password) => {
    const user = await User.create({name,email,password});
    return user;
}

module.exports = genUser;