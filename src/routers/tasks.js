const express = require("express");
const Tasks = require("../models/tasks");
const auth = require("../middleware/auth");
const router = new express.Router();
router.post("/tasks", auth, async (req, res) => {
  const task = new Tasks({ ...req.body, owner: req.user._id });
  try {
    const result = await task.save();
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/tasks", auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true" ? true : false;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Tasks.find({ _id: id, owner: req.user._id });
    if (!task) return res.status(400).send();
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const allowedProperties = ["description", "completed"];
    const isValid = Object.keys(req.body).every((prop) =>
      allowedProperties.includes(prop)
    );
    if (!isValid) return res.status(400).send("Invalid update");
    const task = await Tasks.find({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).send();
    Object.keys(req.body).forEach((prop) => (task[prop] = req.body[prop]));
    await task.save();

    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.delete("/tasks/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Tasks.find({ _id: id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
