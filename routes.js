const path = require('path')
const { body, query, validationResult, } = require('express-validator/check')
const { sanitizeBody, } = require('express-validator/filter')

const User = require('./userModel')
const root = path.resolve(__dirname, ".")
const publicPath = path.join(root, "public")

module.exports = function(app) {

  // DEBUG use to delete users as needed, delete later
  // User.deleteOne({ _id: "5b6710b887e06925b22a8bcb"}, (err, user) => {
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
  // Root Route Handler
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

  // Debug route to view single user in DB
  app.get("/api/users/:username", (req, res, next) => {
    const { username } = req.params
    User.findOne({username}, { _id: 0, username: 1, exercises: 1 })
      .exec((err, {username, exercises}) => {
        if (err) next(new Error(err))
        res.json({username, exercises})
      })
  })

  ///////////////////////////////////////////////////////////
  // Register New User
  ///////////////////////////////////////////////////////////
  app.post('/api/new-user', [

    // Username validation
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters, inclusive')
      .isAlphanumeric()
      .withMessage('Username must consist of only alphanumeric characters'),

  ], (req, res, next) => {
    const { username } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const { param, msg: message, } = errors.array()[0]
      return next({ param, message, })
    }

    const newUser = new User({ username })

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
  app.post('/api/exercise/add', [

    // Exercise validation
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 }).withMessage('Invalid Username')
      .isAlphanumeric().withMessage('Invalid Username'),

    body('description')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Description must be between 3 and 20 characters, inclusive')
      .optional({ checkFalsy: true, }).isAscii()
      .withMessage('Description must contain only valid ascii characters'),

    body('duration')
      .trim()
      .isLength({ min: 1, max: 9999 })
      .withMessage('Duration must be between 1 and 9999 characters, inclusive')
      .isNumeric()
      .withMessage('Duration must be a numeric value'),

    body('date')
      .trim()
      .isISO8601()
      .withMessage('Invalid date')
      .isAfter(new Date(0).toJSON())
      .isBefore(new Date('2999-12-31').toJSON())
      .withMessage("Invalid Date"),

  ], (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const { param, msg: message, } = errors.array()[0]
      return next({ param, message, })
    }

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
app.get('/api/exercise/log', [

  // Exercise validation
  query('username')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Invalid Username')
    .isAlphanumeric().withMessage('Invalid Username'),

  query('from')
    .trim()
    .isISO8601()
    .withMessage('Invalid date')
    .isAfter(new Date(0).toJSON())
    .isBefore(new Date('2999-12-31').toJSON())
    .withMessage("Invalid Date"),

  query('to')
    .trim()
    .isISO8601()
    .withMessage('Invalid date')
    .isAfter(new Date(0).toJSON())
    .isBefore(new Date('2999-12-31').toJSON())
    .withMessage("Invalid Date"),

  query('limit')
    .trim()
    .isNumeric({ no_symbols: true })
    .withMessage('Invalid Number')
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    errors.array().forEach(e => {
      if((e.value !== undefined && e.param !== 'username') || e.param === 'username'){
        const { param, msg: message, } = errors.array()[0]
        return next({ param, message, })
      }
    })
  }

  const { username, from = new Date(0), to = new Date(), limit = 100 } = req.query;

  User.aggregate([{ $match: { username }},
      { $unwind: '$exercises'},
      { $match: {'exercises.date' : { $gte: new Date(from), $lte: new Date(to)}}},
      { $limit: Number(limit) }
    ])
      .then(doc => {
        res.json(doc);
      })
});

  ///////////////////////////////////////////////////////////
  // Default Route Handler
  ///////////////////////////////////////////////////////////
  app.get('*', (req, res, next) => {
    res.redirect('/')
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
