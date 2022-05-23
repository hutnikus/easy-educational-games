const path = require("path")
const http = require("http")
const express = require("express")

const app = express()

const modulesPath = "/node_modules/easy-educational-games/modules"

//set module folder (client side)
app.use("/modules",express.static(modulesPath))

const PORT = process.env.PORT || 3000

module.exports = {
    app,express,PORT,modulesPath
}