const server = require("./app.js")
require("dotenv").config()
console.log();
console.log("********************");
console.log('Server initialized');
console.log("********************");
console.log();
const httpServer = server.listen(process.env.PORT, () => {
    console.log("Server running on port:", process.env.PORT);
})

// Cloudinary handles the large-file transfer; keep Node from timing out first.
httpServer.requestTimeout = 0;
httpServer.timeout = 0;