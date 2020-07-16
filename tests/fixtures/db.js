const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Users = require("../../src/models/users");
const Tasks = require("../../src/models/tasks");
const userOneId = mongoose.Types.ObjectId();
const userTwoId = mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  email: "mike.mk@example.com",
  password: "mike2000",
  age: 19,
  name: "mike",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId.toHexString() }, process.env.JWT_SECRET),
    },
  ],
};
const userTwo = {
  _id: userTwoId,
  email: "mikel.mk@example.com",
  password: "mike2000",
  age: 19,
  name: "mikell",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId.toHexString() }, process.env.JWT_SECRET),
    },
  ],
};

const taskOne = {
  description: "First Task",
  completed: false,
  owner: userOneId,
  _id: mongoose.Types.ObjectId(),
};
const taskTwo = {
  description: "Second Task",
  completed: false,
  owner: userOneId,
  _id: mongoose.Types.ObjectId(),
};
const taskThree = {
  description: "Three Task",
  completed: true,
  owner: userTwoId,
  _id: mongoose.Types.ObjectId(),
};
const setUpDb = async () => {
  await Users.deleteMany();
  await Tasks.deleteMany();
  await new Users(userOne).save();
  await new Users(userTwo).save();
  await new Tasks(taskOne).save();
  await new Tasks(taskTwo).save();
  await new Tasks(taskThree).save();
};

module.exports = {
  user: userOne,
  userTwo,
  setUpDb,
  taskOne,
  taskTwo,
  taskThree,
};
