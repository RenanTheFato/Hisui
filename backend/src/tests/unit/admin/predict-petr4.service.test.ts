import { describe, it, expect, vi, beforeEach } from "vitest";
import { PredictPETR4Service } from "../../../services/machine/petr4/predict-petr4-service.js";

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

describe("PredictPETR4Service", () => {
  const predictPETR4Service = new PredictPETR4Service()
  const mockPrediction = {
    prediction: 28.5,
    confidence: 0.95,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PYTHON_SERVER_URL = "http://mock-python-server.com"
  })

  it("should return prediction successfully (without retrain)", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockPrediction),
    })

    const result = await predictPETR4Service.execute({ period: "1d" })

    expect(mockFetch).toHaveBeenCalledWith(
      "http://mock-python-server.com/petr4/predict",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ period: "1d", retrain: undefined }),
      })
    )
    expect(result).toEqual(mockPrediction)
  })

  it("should return prediction successfully (with retrain)", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockPrediction),
    })

    const result = await predictPETR4Service.execute({
      period: "5d",
      retrain: true,
    })

    expect(mockFetch).toHaveBeenCalledWith(
      "http://mock-python-server.com/petr4/predict",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ period: "5d", retrain: true }),
      })
    )
    expect(result).toEqual(mockPrediction)
  })

  it("should throw an error if the server response is not 200", async () => {
    const errorMessage = "Prediction failed"
    mockFetch.mockResolvedValue({
      status: 400,
      json: () => Promise.resolve({ message: errorMessage }),
    })

    await expect(predictPETR4Service.execute({ period: "1d" })).rejects.toThrow(
      `Failed to get prediction from Python server: ${errorMessage}`
    )
  })

  it("should throw an error if fetch fails", async () => {
    const fetchError = new Error("Network error")
    mockFetch.mockRejectedValue(fetchError)

    await expect(predictPETR4Service.execute({ period: "1d" })).rejects.toThrow(
      `Failed to get prediction from Python server: ${fetchError.message}`
    )
  })
})