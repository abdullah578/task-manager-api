const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tasks = require("./tasks");
//create a user schema with name ,email,password and age required
const userSchema = new mongoose.Schema(
  {
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
    avatar: {
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
//when a user is saved to the database, use the bcrypt algorithm to hide the password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
//when a user is deleted, delete all the corresponding tasks for the user
userSchema.pre("remove", async function (next) {
  const user = this;
  await Tasks.deleteMany({ owner: user._id });
  next();
});
//verify user credentials
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await Users.findOne({ email });
  if (!user) throw new Error("Login Unsuccessful");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Login unsuccessful");
  return user;
};

//create a token for user with a given id
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens.push({ token });
  await user.save();
  return token;
};
userSchema.methods.getPublicProfile = function () {
  const user = { ...this.toObject() };
  delete user.password;
  delete user.tokens;
  delete user.avatar;
  return user;
};

//used to map users to their tasks
userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "owner",
});
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
