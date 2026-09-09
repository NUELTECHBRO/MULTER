const express = require("express")
require("dotenv").config()
const cookieparser = require("cookie-parser");
const connectdb = require("../config/database.js");
const router = require("../routes/routes.js");
const middleware = require("../middleware/middleware.js");
const adminware = require("../middleware/adminware.js");
connectdb()
const app = express()
app.use(cookieparser())
app.set("view engine", "ejs")
app.use(express.static("uploads"))

app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use(adminware)
app.use(middleware)

app.use(router)

module.exports = app;