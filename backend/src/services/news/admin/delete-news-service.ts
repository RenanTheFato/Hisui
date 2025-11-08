import { prisma } from "../../../config/prisma.js";
import { News } from "../../../models/news-model.js";

export class DeleteNewsService{
  async execute({ id: newsId }: Pick<News, 'id'>){
    const isNewsExists = await prisma.news.findFirst({
      where: {
        id: newsId
      },
      select: {
        id: true
      }
    })

    if (!isNewsExists) {
      throw new Error("News not found")
    }

    await prisma.news.delete({
      where: {
        id: isNewsExists.id
      }
    })
  }
}