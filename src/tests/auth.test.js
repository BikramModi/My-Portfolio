import request from "supertest";
import SERVER from "../server.js";

describe("Auth Routes", () => {


  jest.setTimeout(20000);

  it("should register user", async () => {



    const res = await request(SERVER)
      .post("/auth/register")
      .send({
        name: "Test User",
        email: `test_${Date.now()}@gmail.com`,
        password: "password123",
      });

    expect(res.statusCode).toBe(201);

  });

  it("should login user", async () => {

    const userData = {
      name: "Test User",
      email: `test_${Date.now()}@gmail.com`,
      password: "password123",
    };

    // register user first
    await request(SERVER)
      .post("/auth/register")
      .send(userData);

    // then login
    const res = await request(SERVER)
      .post("/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    console.log(res.body);

    expect(res.statusCode).toBe(200);

  });

  it("should logout authenticated user", async () => {

    const userData = {
      name: "Test User",
      email: `test_${Date.now()}@gmail.com`,
      password: "password123",
    };

    // register user
    await request(SERVER)
      .post("/auth/register")
      .send(userData);

    // login user
    const loginRes = await request(SERVER)
      .post("/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    // extract cookies
    const cookies = loginRes.headers["set-cookie"];

    // logout
    const logoutRes = await request(SERVER)
      .post("/auth/logout")
      .set("Cookie", cookies);

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body.message).toBe("Logged out");

  });


  it("should return current user (/me)", async () => {

    const userData = {
      name: "Test User",
      email: `test_${Date.now()}@gmail.com`,
      password: "password123",
    };

    // 1️⃣ register
    await request(SERVER)
      .post("/auth/register")
      .send(userData);

    // 2️⃣ login (to get cookie)
    const loginRes = await request(SERVER)
      .post("/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(loginRes.statusCode).toBe(200);

    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();

    // 3️⃣ call /me with cookie
    const meRes = await request(SERVER)
      .get("/auth/me")
      .set("Cookie", cookies);

    console.log(meRes.body);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user).toBeDefined();
    expect(meRes.body.user.email).toBe(userData.email);

  });

  it("should refresh tokens successfully", async () => {

    const userData = {
      name: "Test User",
      email: `test_${Date.now()}@gmail.com`,
      password: "password123",
    };

    // 1️⃣ register user
    await request(SERVER)
      .post("/auth/register")
      .send(userData);

    // 2️⃣ login user (get cookies)
    const loginRes = await request(SERVER)
      .post("/auth/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(loginRes.statusCode).toBe(200);

    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();

    // 3️⃣ call refresh route
    const refreshRes = await request(SERVER)
      .post("/auth/refresh")
      .set("Cookie", cookies);

    console.log(refreshRes.body);

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.message).toBe("Token refreshed");

  });

  it("should reject refresh if no refresh token", async () => {

    const res = await request(SERVER)
      .post("/auth/refresh");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");

  });

  it("should reject invalid refresh token", async () => {

    const res = await request(SERVER)
      .post("/auth/refresh")
      .set("Cookie", ["refreshToken=invalidtoken"]);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid refresh token");

  });

});

