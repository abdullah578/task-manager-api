const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const Users = require("../models/users");
const auth = require("../middleware/auth");
const { sendWelcomeMail, sendCancellationMail } = require("../emails/accounts");

const router = new express.Router();

//create a new user account 
router.post("/users", async (req, res) => {
  const user = new Users(req.body);
  try {
    await user.save();
    sendWelcomeMail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user: user.getPublicProfile(), token });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Use multer to upload image files (filesize less than 1MB)
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
      return cb(new Error("wrong file type"));
    cb(undefined, true);
  },
});
//uplaod an image as a profile picture
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) return res.status(404).send();
    //used the sharp module to resize the image and convert it to a png
    const fileBuffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = fileBuffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(404).send({ error: err.message });
  }
);

//remove the profile picture
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//get the profile pic for user by id
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user || !user.avatar) throw new Error("Not Found");
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send(err);
  }
});

//allow existing user to login
//returns the auth token when credentials are valid
router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user: user.getPublicProfile(), token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//logout thge user for all devices
router.post("/users/logoutAll", async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send(e);
  }
});
//logout the user from existing device
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
//get user info 
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//update user info
router.patch("/users/me", auth, async (req, res) => {
  try {
    const allowedProperties = ["name", "age", "age", "password"];
    const isValid = Object.keys(req.body).every((prop) =>
      allowedProperties.includes(prop)
    );
    if (!isValid) return res.status(400).send("Invalid update");
    let user = req.user;
    Object.keys(req.body).forEach((prop) => (user[prop] = req.body[prop]));
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

//delete user 
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationMail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;
