const request = require("supertest");
const app = require("../src/app");
const {
  user,
  setUpDb,
  taskThree,
} = require("./fixtures/db");
const Tasks = require("../src/models/tasks");

beforeEach(setUpDb);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .send({
      description: "This is test",
    })
    .expect(201);
  const data = await Tasks.findById(response.body._id);
  expect(data).not.toBeNull();
  expect(data.completed).toBe(false);
});

test("Should fetch tasks for user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toBe(2);
});

test("User cannot delete another user 's tasks", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskThree._id}`)
    .set("auth", `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(404);
  const data = await Tasks.findById(taskThree._id);
  expect(data).not.toBeNull();
});
