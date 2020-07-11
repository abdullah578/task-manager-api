const express = require("express");
const Tasks = require("../models/tasks");
const router = new express.Router();
router.post("/tasks", async (req, res) => {
  const task = new Tasks(req.body);
  try {
    const result = await task.save();
    res.status(201).send(result);
  } catch (err) {
    res.send(400).send(err);
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Tasks.find({});
    res.send(tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Tasks.findById(id);
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
    const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Tasks.findByIdAndDelete(id);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
