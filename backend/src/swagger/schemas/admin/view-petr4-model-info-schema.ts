import { z } from "zod/v4";

export const viewPETR4ModelInfoSchema = {
  tags: ["admin", "models"],
  summary: "View PETR4 Model Information",
  description: "Fetches detailed information about the PETR4 prediction model, including data quality, features, training details, and performance. Requires ADMIN role.",
  security: [
    {
      bearerAuth: []
    }
  ],
  response: {
    200: z.object({
      data: z.object({
        data_quality: z.object({
          missing_data_pct: z.number()
            .describe("Percentage of missing data.")
            .meta({ example: 0 }),
          quality_level: z.string()
            .describe("Overall quality assessment of the dataset.")
            .meta({ example: "Excellent" }),
          quality_score: z.number()
            .describe("Numerical quality score (0–100).")
            .meta({ example: 100 }),
          total_records: z.number()
            .describe("Number of records in the dataset.")
            .meta({ example: 1458 }),
        }),
        features: z.object({
          categories: z.object({
            correlation_features: z.number().meta({ example: 4 }),
            momentum_features: z.number().meta({ example: 2 }),
            price_features: z.number().meta({ example: 20 }),
            technical_indicators: z.number().meta({ example: 14 }),
            temporal_features: z.number().meta({ example: 5 }),
            volatility_features: z.number().meta({ example: 4 }),
            volume_features: z.number().meta({ example: 2 }),
          }),
          feature_list: z.array(z.string())
            .describe("List of features used by the model.")
            .meta({ example: ["log_return_3d", "sma_5", "ema_10"] }),
          total_features: z.number()
            .describe("Total number of features used.")
            .meta({ example: 48 }),
        }),
        model: z.object({
          adaptive_weight: z.number()
            .describe("Adaptive weight of the model.")
            .meta({ example: 0.864 }),
          feature_count: z.number()
            .describe("Number of features actually used in training.")
            .meta({ example: 30 }),
          name: z.string()
            .describe("Model name.")
            .meta({ example: "Ridge" }),
          training_date: z.string()
            .describe("Date when the model was last trained.")
            .meta({ example: "2025-09-14T11:34:00.275295" }),
          type: z.string()
            .describe("Type of model.")
            .meta({ example: "Ridge" }),
        }),
        performance: z.object({
          average_mae: z.number()
            .describe("Average Mean Absolute Error.")
            .meta({ example: 0.4848 }),
          directional_accuracy: z.number()
            .describe("Directional accuracy (0–1).")
            .meta({ example: 1 }),
          error_history_size: z.number()
            .describe("Number of past errors tracked.")
            .meta({ example: 100 }),
          total_predictions: z.number()
            .describe("Total number of predictions made.")
            .meta({ example: 215 }),
        }),
        status: z.string()
          .describe("Status of the request.")
          .meta({ example: "success" }),
        timestamp: z.string()
          .describe("Server timestamp of the response.")
          .meta({ example: "2025-09-14T11:34:00.275314" }),
      })
    }).describe("Model information successfully retrieved."),

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