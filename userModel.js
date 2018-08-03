const mongoose = require('mongoose')

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  exercises:{
    type:Array,
    default:[]
  }
})

module.exports = mongoose.model('userModel', userSchema);