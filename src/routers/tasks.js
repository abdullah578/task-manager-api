const express = require("express");
const Tasks = require("../models/tasks");
const auth = require("../middleware/auth");
const router = new express.Router();

//create new task
router.post("/tasks", auth, async (req, res) => {
  const task = new Tasks({ ...req.body, owner: req.user._id });
  try {
    const result = await task.save();
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
});

//get all tasks for the current user
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true" ? true : false;
  }
  if (req.query.sortBy) {
    const [property, order] = req.query.sortBy.split("_");
    sort[property] = order === "asc" ? 1 : -1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          skip: parseInt(req.query.skip),
          limit: parseInt(req.query.limit),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

//get task by id
router.get("/tasks/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Tasks.find({ _id: id, owner: req.user._id });
    if (!task.length) return res.status(400).send();
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

//update task by id
router.patch("/tasks/:id", async (req, res) => {
  try {
    const allowedProperties = ["description", "completed"];
    const isValid = Object.keys(req.body).every((prop) =>
      allowedProperties.includes(prop)
    );
    if (!isValid) return res.status(400).send("Invalid update");
    const task = await Tasks.find({ _id: req.params.id, owner: req.user._id });
    if (!task.length) return res.status(404).send();
    Object.keys(req.body).forEach((prop) => (task[prop] = req.body[prop]));
    await task.save();

    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

//delete task by id
router.delete("/tasks/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Tasks.find({ _id: id, owner: req.user._id });
    if (!task.length) return res.status(404).send();
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
