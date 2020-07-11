const express = require("express");
const Users = require("../models/users");

const router = new express.Router();
router.post("/users", async (req, res) => {
  const user = new Users(req.body);
  try {
    const result = await user.save();
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.get("/users", async (req, res) => {
  try {
    const users = await Users.find({});
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});
router.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await Users.findById(id);
    if (!user) return res.status(400).send();
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});
router.patch("/users/:id", async (req, res) => {
  try {
    const allowedProperties = ["name", "age", "age", "email", "password"];
    const isValid = Object.keys(req.body).every((prop) =>
      allowedProperties.includes(prop)
    );
    if (!isValid) return res.status(400).send("Invalid update");
    const user = await Users.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await Users.findByIdAndDelete(id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
