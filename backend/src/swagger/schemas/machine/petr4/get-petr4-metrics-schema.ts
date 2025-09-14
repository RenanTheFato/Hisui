import { z } from "zod/v4";

export const getPETR4MetricsSchema = {
  tags: ["metrics", "models"],
  summary: "Get PETR4 Metrics",
  description: "Fetches detailed PETR4 model metrics, including cross-validation settings, data quality, error statistics, model confidence, and performance summary. Requires authentication.",
  security: [
    {
      bearerAuth: []
    }
  ],
  response: {
    200: z.object({
      data: z.object({
        cross_validation: z.object({
          max_splits: z.number().meta({ example: 20 }),
          min_train_size: z.number().meta({ example: 252 }),
          purged_gap: z.number().meta({ example: 2 }),
          step_size: z.number().meta({ example: 5 }),
          test_size: z.number().meta({ example: 21 }),
        }),
        data_info: z.object({
          data_quality_score: z.number()
            .describe("Data quality score (0–100).")
            .meta({ example: 100 }),
          data_records: z.number()
            .describe("Number of records in the dataset.")
            .meta({ example: 1458 }),
          feature_count: z.number()
            .describe("Total number of features available.")
            .meta({ example: 30 }),
        }),
        error_statistics: z.object({
          error_std: z.number()
            .describe("Standard deviation of errors.")
            .meta({ example: 0.2205 }),
          max_error: z.number()
            .describe("Maximum observed error.")
            .meta({ example: 0.7566 }),
          min_error: z.number()
            .describe("Minimum observed error.")
            .meta({ example: 0.0155 }),
          recent_errors: z.array(z.number())
            .describe("List of recent prediction errors.")
            .meta({ example: [0.5273, 0.1085, 0.4448] }),
        }),
        model_confidence: z.object({
          adaptive_weight: z.number()
            .describe("Adaptive model weight.")
            .meta({ example: 0.864 }),
          confidence_level: z.string()
            .describe("Overall model confidence level.")
            .meta({ example: "VERY_HIGH" }),
          error_history_size: z.number()
            .describe("Number of tracked historical errors.")
            .meta({ example: 100 }),
        }),
        performance_summary: z.object({
          average_mae: z.number()
            .describe("Average Mean Absolute Error.")
            .meta({ example: 0.4848 }),
          directional_accuracy: z.number()
            .describe("Directional accuracy (0–1).")
            .meta({ example: 1.0 }),
          error_trend: z.string()
            .describe("Trend of error improvement or worsening.")
            .meta({ example: "IMPROVING" }),
          model_name: z.string()
            .describe("Name of the model used.")
            .meta({ example: "Ridge" }),
          recent_mae: z.number()
            .describe("Most recent Mean Absolute Error.")
            .meta({ example: 0.2943 }),
          total_predictions: z.number()
            .describe("Total number of predictions made.")
            .meta({ example: 215 }),
        }),
        status: z.string()
          .describe("Status of the request.")
          .meta({ example: "success" }),
        timestamp: z.string()
          .describe("Server timestamp of the response.")
          .meta({ example: "2025-09-14T11:40:03.827086" }),
      })
    }).describe("Metrics successfully retrieved."),

    401: z.object({
      message: z.string(),
    }).describe("Unauthorized — Missing, invalid or expired JWT token."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}
