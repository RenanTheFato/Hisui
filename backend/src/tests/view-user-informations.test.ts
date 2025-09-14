import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../config/prisma.js";
import { app } from "../config/server.test.js";
import { routes } from "../routes/index.js";

describe("View User Informations", async () => {
  beforeAll(async () => {
    await app.register(routes)

    await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "view@example.com",
        "password": "*Example777",
        "username": "View User",
      }
    })

    const user = await prisma.users.findUnique({
      where: { email: "view@example.com" }
    })

    if (user) {
      await prisma.users.update({
        where: { id: user.id },
        data: { is_verified: true }
      })
    }
  })

  afterAll(async () => {
    await prisma.users.deleteMany()
    await prisma.$disconnect()
    await app.close()
  })

  it("should view user informations successfully", async () => {
    const authResponse = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "view@example.com",
        "password": "*Example777",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    const response = await app.inject({
      method: "GET",
      url: "/view-user-informations",
      headers: {
        authorization: `Bearer ${authToken}`
      }
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)

    expect(body).toHaveProperty("message")
    expect(body.message).toBe("Your data has fetched with success")
    expect(body).toHaveProperty("user")
    expect(body.user).toHaveProperty("id")
    expect(body.user).toHaveProperty("email", "view@example.com")
    expect(body.user).toHaveProperty("username", "View User")
    expect(body.user).toHaveProperty("role")
    expect(body.user).toHaveProperty("is_verified")
    expect(body.user).toHaveProperty("created_at")
    expect(body.user).toHaveProperty("updated_at")

    expect(body.user).not.toHaveProperty("password_hash")
    expect(typeof body.user.id).toBe("string")
    expect(typeof body.user.email).toBe("string")
    expect(typeof body.user.username).toBe("string")
    expect(typeof body.user.role).toBe("string")
    expect(typeof body.user.is_verified).toBe("boolean")
    expect(new Date(body.user.created_at)).toBeInstanceOf(Date)
    expect(new Date(body.user.updated_at)).toBeInstanceOf(Date)
  })

  it("should fail without authorization header", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/view-user-informations",
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Bearer Token is missing")
  })

  it("should fail with invalid token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/view-user-informations",
      headers: {
        authorization: "Bearer invalid-token"
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Invalid token")
  })

  it("should fail with malformed authorization header", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/view-user-informations",
      headers: {
        authorization: "invalid-format"
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Invalid token")
  })

  it("should fail with empty authorization header", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/view-user-informations",
      headers: {
        authorization: ""
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Bearer Token is missing")

  })

  it("should fail with only 'Bearer' in authorization header", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/view-user-informations",
      headers: {
        authorization: "Bearer"
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Invalid token")
  })

  it("should fail when user does not exist in database", async () => {
    await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "temp@example.com",
        "password": "*Example777",
        "username": "Temp User",
      }
    })


    const user = await prisma.users.findUnique({
      where: {
        email: "temp@example.com"
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

    const authResponse = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "temp@example.com",
        "password": "*Example777",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    if (user) {
      await prisma.users.delete({
        where: { id: user.id }
      })
    }

    const response = await app.inject({
      method: "GET",
      url: "/view-user-informations",
      headers: {
        authorization: `Bearer ${authToken}`
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Unauthorized")
  })
})