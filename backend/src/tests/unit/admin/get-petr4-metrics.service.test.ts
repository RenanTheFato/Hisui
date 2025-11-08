import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetPETR4MetricsService } from "../../../services/machine/petr4/get-petr4-metrics-service.js";

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

describe("GetPETR4MetricsService", () => {
  const getPETR4MetricsService = new GetPETR4MetricsService()

  const mockMetrics = {
    accuracy: 0.85,
    precision: 0.8,
    recall: 0.9,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PYTHON_SERVER_URL = "http://mock-python-server.com"
  })

  it("should return metrics successfully", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockMetrics),
    })

    const result = await getPETR4MetricsService.execute()

    expect(mockFetch).toHaveBeenCalledWith(
      "http://mock-python-server.com/petr4/metrics",
      expect.objectContaining({
        method: "GET",
      })
    )
    expect(result).toEqual(mockMetrics)
  })

  it("should throw an error if the server response is not 200", async () => {
    const errorMessage = "Server error"

    mockFetch.mockResolvedValue({
      status: 500,
      json: () => Promise.resolve({ message: errorMessage }),
    })

    await expect(getPETR4MetricsService.execute()).rejects.toThrow(
      `Failed to get metrics for PETR4 from Python server: ${errorMessage}`
    )
  })

  it("should throw an error if fetch fails", async () => {
    const fetchError = new Error("Network error")
    mockFetch.mockRejectedValue(fetchError)

    await expect(getPETR4MetricsService.execute()).rejects.toThrow(
      `Failed to get metrics for PETR4 from Python server: ${fetchError.message}`
    )
  })
})