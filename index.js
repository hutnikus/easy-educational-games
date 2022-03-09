// const path = require("path");
// const express = require('express')
// const http = require('http')
// const socketio = require('socket.io')

// import * as path from "path"
// import express, * as express_test from "express"
// import * as http from "http"
// import * as socketio from "socket.io"
//
// let PORT;
// let app;
// let server;
// let io;
//
// import {fileURLToPath} from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename)
//
// function startServer(staticFolder) {
//     PORT = process.env.PORT || 3000
//     app = express ? express() : express_test()
//     server = http.createServer(app)
//     io = new socketio.Index(server)
//
//     // Set static folder
//     app.use(express.static(staticFolder))
//
//     // Set module folder
//     app.use("/modules",express.static(path.join(__dirname,"public/modules")))
//
//     // Start server
//     server.listen(PORT, () => console.log(`Index running on port ${PORT}`))
// }
//
// // module.exports = {
// //     startServer,
// //     Game: Game,
// // }
//
// export {startServer}

const Server = require("./public/modules/Server.js")

module.exports = {
    Server: Server.Server,
    modulesPath: "./node_modules/easy-educational-games/public/modules"
}


