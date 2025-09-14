import { z } from "zod/v4";

export const getPythonServerStatusSchema = {
  tags: ["admin", "server"],
  summary: "Get Python Server Status",
  description: "Fetches the current health and status of the Hisui Python Server, including data access, model status, service uptime, and version. Requires ADMIN role.",
  security: [
    {
      bearerAuth: []
    }
  ],
  response: {
    200: z.object({
      message: z.object({
        health: z.object({
          data_access: z.string()
            .describe("Indicates whether the server has access to required data.")
            .meta({ example: "available" }),
          model_status: z.string()
            .describe("Current status of the machine learning model.")
            .meta({ example: "not_loaded" }),
          overall: z.string()
            .describe("Overall system health status.")
            .meta({ example: "degraded" }),
          service_uptime: z.string()
            .describe("Indicates whether the service is running.")
            .meta({ example: "running" }),
        }),
        service: z.string()
          .describe("Name of the running service.")
          .meta({ example: "Hisui Python Server" }),
        status: z.string()
          .describe("General status of the request.")
          .meta({ example: "success" }),
        timestamp: z.string()
          .describe("Server timestamp of the response.")
          .meta({ example: "2025-09-14T10:44:30.506590" }),
        version: z.string()
          .describe("Current version of the service.")
          .meta({ example: "0.0.1" }),
      })
    }).describe("Python server status successfully retrieved."),

    401: z.object({
      message: z.string(),
    }).describe("Unauthorized — Missing, invalid or expired JWT token."),

    403: z.object({
      error: z.string(),
    }).describe("Forbidden — User is authenticated but does not have ADMIN role."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}