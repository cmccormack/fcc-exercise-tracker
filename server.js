///////////////////////////////////////////////////////////
//  Import modules
///////////////////////////////////////////////////////////
const path = require("path")
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const favicon = require('serve-favicon')
require("dotenv").config({ path: path.resolve(__dirname, ".env"), })


///////////////////////////////////////////////////////////
//  Configure and connect to MongoDB database
///////////////////////////////////////////////////////////
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .catch(({ message }) => {
    console.error(`Unable to connect to the mongodb instance: ${message}`)
  }
)

const db = mongoose.connection
db.on("error", ({ message }) => {
  console.error(`Mongoose default connection error: ${message}`)
})
db.once("open", () => {
  console.info(`Mongoose default connection opened`)
})


///////////////////////////////////////////////////////////
//  Initialize Express and configure Middleware
///////////////////////////////////////////////////////////
const app = express()
app.set("port", process.env.PORT || 3000)

// Serve static files
app.use(express.static(path.join(__dirname, "public")))
app.use(favicon(path.resolve(__dirname, 'public', 'images', 'favicon.ico')))

// Body parsing - parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, }))

// Body parsing - parse json
app.use(bodyParser.json())

// Handle cross-site request
app.use(cors())


///////////////////////////////////////////////////////////
//  Import Express Routes
///////////////////////////////////////////////////////////
require("./routes")(app);


///////////////////////////////////////////////////////////
//  Start Express Server
///////////////////////////////////////////////////////////
const server = app.listen(app.get("port"), () => {
  const { port, address, } = server.address()
  console.info(`Express server started on ${address}:${port}`)
})