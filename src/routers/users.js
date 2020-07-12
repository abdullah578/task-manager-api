const express = require("express");
const Users = require("../models/users");
const auth = require("../middleware/auth");

const router = new express.Router();
router.post("/users", async (req, res) => {
  const user = new Users(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/logoutAll", async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send(e);
  }
});
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (curr) => curr.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send(err);
  }
});
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
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
    let user = await Users.findById(req.params.id);
    Object.keys(req.body).forEach((prop) => (user[prop] = req.body[prop]));
    await user.save();

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
