import { schedule } from "node-cron";
import { NewsPackage } from "../../packages/news-package.js";
import { prisma } from "../../config/prisma.js";
import { sendNewsEmail } from "../../packages/news-mail-package.js";

const newsPackage = new NewsPackage()

export const newsJob = schedule("0 */15 * * * *", async () => {
  console.log("Cron Job for News Package Executing")
  await newsPackage.fetchNews()
  console.log("Cron Job Executed Successfully")
})

export const newsDailyEmailJob = schedule("0 0 */6 * * *", async () => {
  console.log("Starting Daily News Email Distribution")
  try {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const recentNews = await prisma.news.findMany({
      where: {
        published_at: {
          gte: yesterday
        }
      },
      orderBy: {
        published_at: 'desc'
      }
    })

    if (recentNews.length === 0) {
      console.log("No recent news found to send")
      return
    }

    const randomIndex = Math.floor(Math.random() * recentNews.length)
    const selectedNews = recentNews[randomIndex]

    const usersWithNewsEnabled = await prisma.users.findMany({
      where: {
        is_verified: true,
        userPreferences: {
          allow_news_notifications: true
        }
      },
      include: {
        userPreferences: true
      }
    })

    if (usersWithNewsEnabled.length === 0) {
      console.log("No users with news notifications enabled")
      return
    }

    console.log(`Selected news: ${selectedNews.title}`)
    console.log(`Sending to ${usersWithNewsEnabled.length} users`)

    const BATCH_SIZE = 10
    const DELAY_BETWEEN_BATCHES = 2000
    const DELAY_BETWEEN_EMAILS = 200

    let totalSent = 0
    let totalFailed = 0


    for (let i = 0; i < usersWithNewsEnabled.length; i += BATCH_SIZE) {
      const batch = usersWithNewsEnabled.slice(i, i + BATCH_SIZE)
      
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(usersWithNewsEnabled.length / BATCH_SIZE)}`)

      for (const user of batch) {
        try {
          await sendNewsEmail({
            email: user.email,
            username: user.username,
            newsTitle: selectedNews.title,
            newsDescription: selectedNews.description,
            newsAuthor: selectedNews.author,
            newsPublisher: selectedNews.publisher_name,
            newsPublishedDate: selectedNews.published_at,
            newsArticleUrl: selectedNews.article_url,
            newsImageUrl: selectedNews.image_url,
            newsTickers: selectedNews.tickers
          })

          totalSent++
          console.log(`Email sent to ${user.email} (${totalSent}/${usersWithNewsEnabled.length})`)

          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS))
        } catch (error) {
          totalFailed++
          console.error(`Failed to send email to ${user.email}:`, error)
        }
      }


      if (i + BATCH_SIZE < usersWithNewsEnabled.length) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`)
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
      }
    }

    console.log(`Daily News Email Distribution Complete`)
    console.log(`Total sent: ${totalSent}`)
    console.log(`Total failed: ${totalFailed}`)
    console.log(`Success rate: ${((totalSent / usersWithNewsEnabled.length) * 100).toFixed(2)}%`)

  } catch (error) {
    console.error("Error in Daily News Email Distribution:", error)
  }
})