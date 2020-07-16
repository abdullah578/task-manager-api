const request = require("supertest");
const app = require("../src/app");
const Users = require("../src/models/users");
const { user, setUpDb } = require("./fixtures/db");

beforeEach(setUpDb);

test("Should sign up a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Abdullah Mohammed",
      email: "abdullah.am2000@gmail.com",
      password: "abdullah2000",
      age: 19,
    })
    .expect(201);
  const user = await Users.findById(response.body.user._id);

  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: user.name,
      email: user.email,
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe("abdullah2000");
});

test("Should login an existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);
  const data = await Users.findById(response.body.user._id);
  expect(data).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: data.name,
      email: data.email,
    },
    token: data.tokens[1].token,
  });
});

test("Should not login user with bad credentials", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: user.email,
      password: "testchdbb",
    })
    .expect(400);
});

test("Should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);
  const data = await Users.findById(response.body._id);
  expect(data).toBeFalsy();
});

test("Should not delete account for unauthroized user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload image avatar", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .attach("avatar", "./tests/fixtures/profile-pic.jpg")
    .expect(200);

  const data = await Users.findById(user._id);

  expect(data.avatar).toEqual(expect.any(Buffer));
});

test("Update user fields", async () => {
  const newName = "Mikell";
  await request(app)
    .patch("/users/me")
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .send({
      name: newName,
    })
    .expect(200);
  const data = await Users.findById(user._id);
  expect(data.name).toBe(newName);
});

test("Update invalid field", async () => {
  await request(app)
    .patch("/users/me")
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .send({ location: "jcj" })
    .expect(400);
});
