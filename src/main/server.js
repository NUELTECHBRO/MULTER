const server = require("./app.js")
require("dotenv").config()
console.log();
console.log("********************");
console.log('Server initialized');
console.log("********************");
console.log();
server.listen(process.env.PORT, () => {
    console.log("Server running on port: ", process.env.PORT);
})