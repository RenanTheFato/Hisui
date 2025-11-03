import { schedule } from "node-cron";
import { NewsPackage } from "../../packages/news-package.js";

const newsPackage = new NewsPackage()

export const newsJob = schedule("0 */15 * * * *", async() => {
  console.log("Cron Job for News Package Executing")
  await newsPackage.fetchNews()
  console.log("Cron Job Executed Successfully")
})