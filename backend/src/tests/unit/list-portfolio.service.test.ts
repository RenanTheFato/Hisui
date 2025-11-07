import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListPortfolioService } from "../../services/portfolio/list-portfolio-service.js";
import { prisma } from "../../config/prisma.js";

vi.mock("../../config/prisma.js", () => ({
  prisma: {
    portfolio: {
      findMany: vi.fn(),
    },
  },
}))

describe("ListPortfolioService", () => {
  const listPortfolioService = new ListPortfolioService()
  const mockUserId = "1"
  const mockPortfolios = [
    {
      id: "1",
      user_id: mockUserId,
      name: "Portfolio A",
      description: "Desc A",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "2",
      user_id: mockUserId,
      name: "Portfolio B",
      description: "Desc B",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return all user portfolios when no name is provided", async () => {
    vi.mocked(prisma.portfolio.findMany).mockResolvedValue(mockPortfolios)

    const result = await listPortfolioService.execute({ userId: mockUserId })

    expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
      where: {
        user_id: mockUserId,
      },
      orderBy: {
        name: "asc",
      },
    })
    expect(result).toEqual(mockPortfolios)
  })

  it("should return portfolios filtered by name (case-insensitive)", async () => {
    const filteredPortfolios = [mockPortfolios[0]]
    vi.mocked(prisma.portfolio.findMany).mockResolvedValue(filteredPortfolios)

    const result = await listPortfolioService.execute({
      userId: mockUserId,
      name: "portfolio a",
    })

    expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
      where: {
        user_id: mockUserId,
        name: {
          contains: "portfolio a",
          mode: "insensitive",
        },
      },
      orderBy: {
        name: "asc",
      },
    })
    expect(result).toEqual(filteredPortfolios)
  })

  it("should throw an error if the user has no portfolios", async () => {
    vi.mocked(prisma.portfolio.findMany).mockResolvedValue([])

    await expect(
      listPortfolioService.execute({ userId: mockUserId })
    ).rejects.toThrow("You don't have a portfolio")
  })
})