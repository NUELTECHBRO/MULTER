const {PORT} = require("../config/env.js")
const server = require("./app.js")

console.log();
console.log("********************");
console.log('Server initialized');
console.log("********************");
console.log();
const httpServer = server.listen(PORT, () => {
    console.log("Server running on port:", PORT);
})

// Cloudinary handles the large-file transfer; keep Node from timing out first.
httpServer.requestTimeout = 0;
httpServer.timeout = 0;