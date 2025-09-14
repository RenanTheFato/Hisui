import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../config/prisma.js";
import { app } from "../config/server.test.js";
import { routes } from "../routes/index.js";

describe("Create User", async () => {
  beforeAll(async () => {
    await app.register(routes)
  })

  afterAll(async () => {
    await prisma.users.deleteMany()
    await prisma.$disconnect()
    await app.close()
  })

  it("should create a user successfully", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "email@example.com",
        "password": "*Example777",
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body).toEqual({ message: "Please check your email to verify your account" })
  })

  it("should fail with invalid email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "invalid-format",
        "password": "*Example777",
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("The value has entered isn't a email or the email is invalid.")
  })

  it("shloud fail when password lacks an uppercase letter", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "test.uppercase.letter@example.com",
        "password": "*example",
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("Password must contain at least one uppercase letter.")
  })

  it("shloud fail when password lacks a number", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "test.number@example.com",
        "password": "*Example",
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("Password must contain at least one number.")
  })

  it("shloud fail when password lacks an special character", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "test.character@example.com",
        "password": "Example777",
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("Password must contain at least one special character ('@', '#', '$', '*', '&').")
  })

  it("should fail when password is too short", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "test.short@example.com",
        "password": "*Ex1",
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("Password must contain at least 8 characters.")
  })

  it("should fail when password is too long", async () => {
    const longPassword = "*S" + "a".repeat(130) + "1"

    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "test.long@example.com",
        "password": longPassword,
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("Password cannot exceed 128 characters.")
  })

  it("should fail with too short username", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "test.username@example.com",
        "password": "*Example777",
        "username": "A",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("The username must have at least 2 characters.")
  })

  it("should fail with too long username", async () => {
    const longName = "*S" + "a".repeat(130) + "1"

    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "test.username@example.com",
        "password": "*Example777",
        "username": longName
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain("The username cannot exceed 128 characters.")
  })

  it("should fail with duplicate emails", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/create-user",
      payload: {
        "email": "email@example.com",
        "password": "*Example777",
        "username": "Example User",
      }
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.error).toContain("The email is already in use")
  })
})