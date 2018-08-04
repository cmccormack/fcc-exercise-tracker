const mongoose = require('mongoose')

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  exercises: [{
    description: String,
    duration: Number,
    date: Date,
  }]
})


module.exports = mongoose.model('userModel', userSchema);