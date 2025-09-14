import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../config/prisma.js";
import { app } from "../config/server.test.js";
import { routes } from "../routes/index.js";

describe("Reset Password", async () => {
  let userId: string
  let authToken: string

  beforeAll(async () => {
    await app.register(routes)
    await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "reset@example.com",
        "password": "*Example777",
        "username": "Reset User",
      }
    })

    const user = await prisma.users.findUnique({
      where: {
        email: "reset@example.com"
      }
    })

    if (user) {
      userId = user.id
      await prisma.users.update({
        where: {
          id: userId
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
        "email": "reset@example.com",
        "password": "*Example777",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    authToken = authBody.token
  })

  afterAll(async () => {
    await prisma.users.deleteMany()
    await prisma.$disconnect()
    await app.close()
  })

  it("should reset password successfully", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*Example777",
        "new_password": "*NewExample888",
      }
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body.message).toBe("Password reseted successfully")
  })

  it("should fail with wrong old password", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "WrongPassword*123",
        "new_password": "*NewExample888",
      }
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("error")
    expect(body.error).toBe("The entered password and the current password do not match")
  })

  it("should fail with invalid new password - no uppercase", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*Example777",
        "new_password": "*example888",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body).toHaveProperty("errors")
    expect(body.message).toBe("Validation Error Ocurred")
    expect(body.errors[0].message).toBe("Password must contain at least one uppercase letter.")
  })

  it("should fail with invalid new password - no number", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*Example777",
        "new_password": "*Example",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body).toHaveProperty("errors")
    expect(body.message).toBe("Validation Error Ocurred")
    expect(body.errors[0].message).toBe("Password must contain at least one number.")
  })

  it("should fail with invalid new password - no special character", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*Example777",
        "new_password": "Example888",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body).toHaveProperty("errors")
    expect(body.message).toBe("Validation Error Ocurred")
    expect(body.errors[0].message).toBe("Password must contain at least one of these special characters ('@' '#' ' '*' '&').")
  })

  it("should fail with too short new password", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*Example777",
        "new_password": "*Ex1",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body).toHaveProperty("errors")
    expect(body.message).toBe("Validation Error Ocurred")
    expect(body.errors[0].message).toBe("The password doesn't meet the minimum number of characters (8).")
  })

  it("should fail with too long new password", async () => {
    const longPassword = "*S" + "a".repeat(130) + "1"

    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*Example777",
        "new_password": longPassword,
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body).toHaveProperty("errors")
    expect(body.message).toBe("Validation Error Ocurred")
    expect(body.errors[0].message).toBe("The password has exceeded the character limit (128).")
  })

  it("should fail without authentication token", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      payload: {
        "old_password": "*Example777",
        "new_password": "*NewExample888",
      }
    })

    expect(response.statusCode).toBe(401)
  })

  it("should fail with missing old_password", async () => {
    const authResponse = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "reset@example.com",
        "password": "*NewExample888",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "new_password": "*AnotherNew888",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body.message).toBe("Validation Error Ocurred")
  })

  it("should fail with missing new_password", async () => {
    const authResponse = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "reset@example.com",
        "password": "*NewExample888",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*NewExample888",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body.message).toBe("Validation Error Ocurred")
  })

  it("should fail with non-string old_password", async () => {
    const authResponse = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "reset@example.com",
        "password": "*NewExample888",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": 123,
        "new_password": "*AnotherNew888",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body.message).toBe("Validation Error Ocurred")
  })

  it("should fail with non-string new_password", async () => {
    const authResponse = await app.inject({
      method: "POST",
      url: "/auth-user",
      payload: {
        "email": "reset@example.com",
        "password": "*NewExample888",
      }
    })

    const authBody = JSON.parse(authResponse.body)
    const authToken = authBody.token

    const response = await app.inject({
      method: "PUT",
      url: "/reset-password",
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {
        "old_password": "*NewExample888",
        "new_password": 123,
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty("message")
    expect(body.message).toBe("Validation Error Ocurred")
  })
})