import { z } from "zod/v4";

export const predictPETR4Schema = {
  tags: ["prediction"],
  summary: "Predict PETR4 Stock Price",
  description: "Generates a prediction for PETR4 stock price using historical data and the Ridge model. Requires a valid JWT token.",
  security: [
    {
      bearerAuth: []
    }
  ],
  body: z.object({
    period: z.enum(['1y', '2y', '3y', '4y', '5y', '6y', '7y', '8y'] as const)
      .describe("Historical period of data to be used for training and prediction.")
      .meta({
        example: "6y"
      }),
    retrain: z.boolean()
      .optional()
      .describe("If true, retrains the model before predicting.")
      .meta({
        example: true
      }),
  }),
  response: {
    200: z.object({
      result: z.object({
        confidence: z.object({
          confidence_intervals: z.object({
            "68_percent": z.object({
              lower: z.number()
                .describe("Lower bound of the 68% confidence interval.")
                .meta({ example: 30.86 }),
              upper: z.number()
                .describe("Upper bound of the 68% confidence interval.")
                .meta({ example: 31.83 }),
            }),
            "95_percent": z.object({
              lower: z.number()
                .describe("Lower bound of the 95% confidence interval.")
                .meta({ example: 30.37 }),
              upper: z.number()
                .describe("Upper bound of the 95% confidence interval.")
                .meta({ example: 32.31 }),
            }),
          }),
          model_confidence: z.number()
            .describe("Confidence score of the model.")
            .meta({ example: 0.932 }),
        }),
        model_info: z.object({
          model_name: z.string()
            .describe("Name of the model used.")
            .meta({ example: "Ridge" }),
          prediction_timestamp: z.string()
            .describe("Timestamp when prediction was made.")
            .meta({ example: "2025-09-14T10:32:57.653482" }),
        }),
        prediction: z.object({
          change_absolute: z.number()
            .describe("Absolute change predicted.")
            .meta({ example: 0.16 }),
          change_percentage: z.number()
            .describe("Percentage change predicted.")
            .meta({ example: 0.52 }),
          current_price: z.number()
            .describe("Current price of the asset.")
            .meta({ example: 31.18 }),
          movement_direction: z.string()
            .describe("Predicted market movement direction.")
            .meta({ example: "SIDEWAYS" }),
          next_trading_date: z.string()
            .describe("Next trading date.")
            .meta({ example: "2025-09-15" }),
          predicted_price: z.number()
            .describe("Predicted price for the next trading date.")
            .meta({ example: 31.34 }),
        }),
        recommendation: z.object({
          action: z.string()
            .describe("Recommended action.")
            .meta({ example: "BUY MODERATE" }),
          risk_level: z.string()
            .describe("Associated risk level.")
            .meta({ example: "MEDIUM" }),
        }),
        retrain_info: z.object({
          period_used: z.string()
            .describe("Training period used.")
            .meta({ example: "6y" }),
          retrained: z.boolean()
            .describe("Whether the model was retrained.")
            .meta({ example: true }),
        }),
        status: z.string()
          .describe("Status of the prediction.")
          .meta({ example: "success" }),
        timestamp: z.string()
          .describe("Server timestamp.")
          .meta({ example: "2025-09-14T10:32:57.653516" }),
      }),
    }).describe("Prediction successfully generated."),
    
    400: z.object({
      message: z.string(),
      errors: z.array(z.object({
        code: z.string(),
        message: z.string(),
        path: z.string(),
      })),
    }).describe("Validation Error — Invalid or missing input."),

    401: z.object({
      error: z.string(),
    }).describe("Unauthorized — Missing, invalid, or expired JWT token."),

    500: z.object({
      error: z.string(),
    }).describe("Unexpected server error."),
  }
}