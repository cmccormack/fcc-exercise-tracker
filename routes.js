const path = require('path')
const root = path.resolve(__dirname, "..")
const publicPath = path.join(root, "public")

const app = require('express')()

///////////////////////////////////////////////////////////
// Testing/Debug Middleware
///////////////////////////////////////////////////////////
app.use((req, res, next) => {
  console.debug(`DEBUG originalUrl: ${req.originalUrl}`)
  next()
})



///////////////////////////////////////////////////////////
// Default Route Handler
///////////////////////////////////////////////////////////
app.get('*', (req, res, next) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})
