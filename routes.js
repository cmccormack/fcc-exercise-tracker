const path = require('path')
const root = path.resolve(__dirname, ".")
const publicPath = path.join(root, "public")
const userModel = require('./userModel')
const app = require('express')()

module.exports = function(app) {

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
  app.get('/', (req, res, next) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  });

  //this works for creating a user - can be deleted
  app.get('/test', (req, res, next) => {
    const newUser = new userModel({
      username: "me"
    })

    newUser.save().then(() => {
      console.log(`user "me" created`);
      res.send(`user created`);
    }).catch(e => {
      console.log(e);
      res.send(e);
    })
  });

  /*route for creating user
  .post - req, res =>
    check if user exists in db
    -if so respond with error or something
    -if not respond with success

  */


  /*route for submitting exercise
    .post - req, res =>
    Check if id or username/password match
    Add exercise to db => send success message?
    Error response if not

  */


  /*route for retrieving user/exercise info
    GET /exercise/log?{userId}[&from][&to][&limit]
  .get - req, res => 
  use req.query to retrieve info from db
  error response if not matched
  respond with json info if found

  */

} //end module.exports