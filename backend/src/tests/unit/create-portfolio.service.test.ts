import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreatePortfolioService } from "../../services/portfolio/create-portfolio-service.js";
import { prisma } from "../../config/prisma.js";

vi.mock("../../config/prisma.js", () => ({
  prisma: {
    portfolio: {
      create: vi.fn(),
    },
  },
}))

describe("CreatePortfolioService", () => {
  const createPortfolioService = new CreatePortfolioService()
  const mockUserId = "1"
  const mockPortfolioName = "My Test Portfolio"
  const mockPortfolioDescription = "A test portfolio"

  const mockPortfolio = {
    id: "1", // must be a string
    user_id: mockUserId,
    name: mockPortfolioName,
    description: mockPortfolioDescription,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a new portfolio successfully", async () => {
    vi.mocked(prisma.portfolio.create).mockResolvedValue(mockPortfolio)

    const result = await createPortfolioService.execute({
      userId: mockUserId,
      name: mockPortfolioName,
      description: mockPortfolioDescription,
    })

    expect(prisma.portfolio.create).toHaveBeenCalledWith({
      data: {
        user_id: mockUserId,
        name: mockPortfolioName,
        description: mockPortfolioDescription,
      },
    })
    expect(result).toEqual(mockPortfolio)
  })
})
