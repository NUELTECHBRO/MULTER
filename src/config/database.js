const mongoose = require("mongoose")
require("dotenv").config()

const connectdb = async() => {
    try {
        await mongoose.connect(process.env.MONGOURL)
        console.log();
        console.log("--------------------------");
        console.log("✔Mongo db connected succesfully");
        console.log("--------------------------");
        console.log();

    } catch (error) {
        console.log();
        console.log("👀Oops failed to connect to mongo db");
    }
}

module.exports = connectdb;