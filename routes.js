const path = require('path')
const User = require('./userModel')

const root = path.resolve(__dirname, ".")
const publicPath = path.join(root, "public")

module.exports = function(app) {

  // DEBUG use to delete users as needed, delete later
  // User.deleteOne({ _id: "5b64c412b8bef220dc4b4c0d"}, (err, user) => {
  //   if (err) return next(new Error(err))
  //   console.log(user)
  // })

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

  // Debug route to view users in DB
  app.get("/api/users", (req, res, next) => {
    User.find({})
    .exec((err, users) => {
      if (err) next(new Error(err))
      res.json(users)
    })
  })

  //Route for creating user
  app.post('/api/new-user', (req, res, next) => {
    const { username } = req.body
    const newUser = new User({ username })
    // Need to add username validation

    newUser.save(err => {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          return next(new Error(`Username '${username}' already taken`))
        }
        return next(new Error("Unable to process new user request"))
      }
      res.json({
        success: true,
        message: `User ${username} successfully added`
      })
    })
  })

  //Route for submitting exercise
  app.post('/api/add-exercise', (req, res, next) => {
    const { username, description, duration, date } = req.body
    const newExercise = {
      description : description,
      duration : duration,
      date: date
    }

    User.findOne({ username: username }, function (err, data) {
      if(err) {
        return next(new Error(`Something went wrong`))
      }
      if(data === null) {
        return next(new Error(`Username ${username} not found`))
      }
      
      data.exercises.push(newExercise)
      data.save((err, data) => {
        if (err) {
          return next(new Error(`Could not save data`))
        }
        return res.json({
          success: true,
          message: `Exercise successfully added`
        })
      })
    })
  })
  
  /*route for retrieving user/exercise info
    GET /exercise/log?{userId}[&from][&to][&limit]
  .get - req, res => 
  use req.query to retrieve info from db
  error response if not matched
  respond with json info if found

  */

  app.get('*', (req, res, next) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  });


  ///////////////////////////////////////////////////////////
  // Error Handler
  ///////////////////////////////////////////////////////////
  /* eslint no-unused-vars: 0 */
  app.use((err, req, res, next) => {
    console.error(err)
    res.json({
      success: false,
      error: err.message
    })
  })

} //end module.exports