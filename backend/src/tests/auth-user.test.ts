import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../config/prisma.js";
import { app } from "../config/server.test.js";
import { routes } from "../routes/index.js";

describe("Auth User", async () => {
  beforeAll(async () => {
    await app.register(routes)

    await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "auth@example.com",
        "password": "*Example777",
        "username": "Auth User",
      }
    })

    const user = await prisma.users.findUnique({
      where: {
        email: "auth@example.com"
      }
    })
    if (user) {
      await prisma.users.update({
        where: {
          id: user.id
        },
        data: {
          is_verified: true
        }
      })
    }
  })

  afterAll(async () => {
    await prisma.users.deleteMany()
    await prisma.$disconnect()
    await app.close()
  })

  it("should authenticate user successfully", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "auth@example.com",
        "password": "*Example777",
      }
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("token")
    expect(typeof body.token).toBe("string")
  })

  it("should fail with invalid email format", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "invalid-email",
        "password": "*Example777",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("statusCode", 400)
    expect(body).toHaveProperty("code")
    expect(body).toHaveProperty("error")
    expect(body).toHaveProperty("message")
    expect(body.message).toContain("The provided value must be a string or invalid email format.")
  })

  it("should fail with invalid credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "auth@example.com",
        "password": "WrongPassword123*",
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("error")
    expect(body.error).toBe("Invalid email or password")
  })

  it("should fail with non-existent email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "nonexistent@example.com",
        "password": "*Example777",
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("error")
    expect(body.error).toBe("Invalid email or password")
  })

  it("should fail with missing password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "auth@example.com",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("statusCode", 400)
    expect(body).toHaveProperty("message")
    expect(body.message).toContain("The provided value must be a string.")
  })

  it("should fail with missing email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "password": "*Example777",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("statusCode", 400)
    expect(body).toHaveProperty("message")
    expect(body.message).toContain("The provided value must be a string or invalid email format.")
  })

  it("should fail with non-string email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": 123,
        "password": "*Example777",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("statusCode", 400)
    expect(body).toHaveProperty("message")
    expect(body.message).toContain("The provided value must be a string or invalid email format.")
  })

  it("should fail with non-string password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "auth@example.com",
        "password": 123,
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("statusCode", 400)
    expect(body).toHaveProperty("message")
    expect(body.message).toContain("The provided value must be a string.")
  })
})