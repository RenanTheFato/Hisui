import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../config/prisma.js";
import { app } from "../config/server.test.js";
import { routes } from "../routes/index.js";

describe("Delete User", async () => {
  beforeAll(async () => {
    await app.register(routes)

    await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "delete@example.com",
        "password": "*Example777",
        "username": "Delete User",
      }
    })

    const user = await prisma.users.findUnique({
      where: {
        email: "delete@example.com"
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

  it("should delete user successfully", async () => {
    const authResponse = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "delete@example.com",
        "password": "*Example777",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    const response = await app.inject({
      method: "DELETE",
      url: "/delete-user",
      headers: {
        authorization: `Bearer ${authToken}`
      }
    })

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe("")
  })

  it("should fail without authorization header", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/delete-user",
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Bearer Token is missing")
  })

  it("should fail with invalid token", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/delete-user",
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
      method: "DELETE",
      url: "/delete-user",
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
      method: "DELETE",
      url: "/delete-user",
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
      method: "DELETE",
      url: "/delete-user",
      headers: {
        authorization: "Bearer"
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Invalid token")
  })

  it("should return 401 for missing user ID (if user already deleted)", async () => {
    await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "delete2@example.com",
        "password": "*Example777",
        "username": "Delete User 2",
      }
    })

    const user = await prisma.users.findUnique({
      where: {
        email: "delete2@example.com"
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
        "email": "delete2@example.com",
        "password": "*Example777",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const newAuthToken = authBody.token

    await app.inject({
      method: "DELETE",
      url: "/delete-user",
      headers: {
        authorization: `Bearer ${newAuthToken}`
      }
    })

    const response = await app.inject({
      method: "DELETE",
      url: "/delete-user",
      headers: {
        authorization: `Bearer ${newAuthToken}`
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body.message).toBe("Unauthorized")
  })

  it("should fail when user does not exist in database but token is valid", async () => {
    await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "temp-delete@example.com",
        "password": "*Example777",
        "username": "Temp Delete User",
      }
    })

    const user = await prisma.users.findUnique({
      where: {
        email: "temp-delete@example.com"
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
        "email": "temp-delete@example.com",
        "password": "*Example777",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    if (user) {
      await prisma.users.delete({
        where: {
          id: user.id
        }
      })
    }

    const response = await app.inject({
      method: "DELETE",
      url: "/delete-user",
      headers: {
        authorization: `Bearer ${authToken}`
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message", "Unauthorized")
  })
})