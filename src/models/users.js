const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid Email");
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 1,
    default: 20,
  },
});


const Users = mongoose.model("Users",userSchema);

module.exports = Users;
