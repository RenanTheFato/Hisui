import { FastifyReply } from "fastify"
import { prisma } from "../config/prisma.js"

interface NewsArticle {
  id: string
  publisher: {
    name: string
    homepage_url: string
    logo_url: string
    favicon_url: string
  }
  title: string
  author: string
  published_utc: string
  article_url: string
  tickers: string[]
  amp_url?: string
  image_url: string
  description: string
  insights: any[]
}

interface NewsResponse {
  results: NewsArticle[]
  count: number
  next_url?: string
  request_id: string
  status: string
}

export class NewsPackage {
  async fetchNews(rep: FastifyReply) {
    try {
      const API_KEY = process.env.MASSIVE_API_KEY
      const defaultTimestamp = new Date().toISOString().split("T")[0]

      const allowedPublishers = [
        "https://www.investing.com/",
        "https://www.reuters.com/",
        "https://www.benzinga.com/",
        "https://www.fool.com/",
        "https://www.wsj.com/",
        "https://www.ft.com/",
        "https://www.marketwatch.com/"
      ]

      const BATCH_SIZE = 25
      const allNews: NewsArticle[] = []
      let totalInserted = 0

      for (const publisherUrl of allowedPublishers) {

        const news = await fetch(`https://api.massive.com/v2/reference/news?published_utc.gte=${defaultTimestamp}&order=desc&limit=100&sort=published_utc&apiKey=${API_KEY}`)

        if (!news.ok) {
          continue
        }

        const data = await news.json() as NewsResponse

        const filteredResults = data.results.filter((article) =>
          article.publisher.homepage_url === publisherUrl
        )

        if (filteredResults.length > 0) {
          for (let i = 0; i < filteredResults.length; i += BATCH_SIZE) {
            const batch = filteredResults.slice(i, i + BATCH_SIZE)

            const result = await prisma.news.createMany({
              data: batch.map(article => ({
                id: article.id,
                publisher_name: article.publisher.name,
                publisher_url: article.publisher.homepage_url,
                title: article.title,
                author: article.author,
                published_at: new Date(article.published_utc),
                article_url: article.article_url,
                tickers: article.tickers,
                amp_url: article.amp_url || null,
                image_url: article.image_url,
                description: article.description,
                insights: article.insights
              })),
              skipDuplicates: true
            })

            totalInserted += result.count
          }

          allNews.push(...filteredResults)
        }

        await new Promise(resolve => setTimeout(resolve, 200))
      }

      return rep.status(200).send({ news: allNews })

    } catch (error: any) {
      return rep.status(500).send({ error: error.message })
    }
  }
}