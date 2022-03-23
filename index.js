const path = require("path")
const http = require("http")
const express = require("express")

const app = express()

//set module folder (client side)
app.use("/modules",express.static("./node_modules/easy-educational-games/public/modules"))

const PORT = process.env.PORT || 3000

module.exports = {
    app,express,PORT,
    modulesPath: "./node_modules/easy-educational-games/public/modules"
}