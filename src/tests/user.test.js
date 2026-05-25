import request from "supertest";
import SERVER from "../server.js";

describe("User Routes", () => {

  jest.setTimeout(20000);

  it("should create user after login", async () => {

    // 1️⃣ Register admin/authenticated user
    const authUser = {
      name: "Auth User",
      email: `auth_${Date.now()}@gmail.com`,
      password: "password123",
    };

    await request(SERVER)
      .post("/auth/register")
      .send(authUser);

    // 2️⃣ Login to get cookies
    const loginRes = await request(SERVER)
      .post("/auth/login")
      .send({
        email: authUser.email,
        password: authUser.password,
      });

    expect(loginRes.statusCode).toBe(200);

    const cookies = loginRes.headers["set-cookie"];

    expect(cookies).toBeDefined();

    // 3️⃣ Access protected route
    const res = await request(SERVER)
      .post("/users")
      .set("Cookie", cookies)
      .send({
        name: "New User",
        email: `new_${Date.now()}@gmail.com`,
        password: "password123",
      });

    console.log(res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBeDefined();

  });

  it("should reject unauthenticated user", async () => {

  const res = await request(SERVER)
    .post("/users")
    .send({
      name: "Test",
      email: `test_${Date.now()}@gmail.com`,
      password: "password123",
    });

  expect(res.statusCode).toBe(401);

});

});