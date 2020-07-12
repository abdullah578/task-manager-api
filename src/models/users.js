const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await Users.findOne({ email });
  if (!user) throw new Error("Login Unsuccessful");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Login unsuccessful");
  return user;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "Thisismycoursepayload");
  user.tokens.push({ token });
  await user.save();
  return token;
};
userSchema.methods.getPublicProfile = function () {
  const user = this;
  return { name: user.name, _id: user._id, email: user.email, age: user.age };
};

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
