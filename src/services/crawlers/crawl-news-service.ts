import { NewsSources } from "@/constants/news-sources";
import { TIME_CONSTANTS } from "@/constants/time-constants";
import { News } from "@/types/news";
import axios from "axios";
import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import RedisService from "../databases/redis-service";
export class CrawlNewsService {
    private _redisService: RedisService;
    constructor(RedisService: RedisService) {
        // Initialize any required properties or dependencies here
        this._redisService = RedisService;
    }

    public getNewsByCategory = async (categoryName: string) => {
        try {
            const redisKey = `MEZON-BOT-NEWS:${categoryName}`;
            // Check if news is already cached in Redis
            const cachedNews = await this._redisService.getCache(redisKey);
            if (cachedNews) {
                console.log("Cache hit for news:", categoryName);
                return cachedNews;
            }

            const response = await axios.get(`${NewsSources.BAO_MOI_LITE}/_next/data/${process.env.BAO_MOI_API_KEY}/category/${categoryName}.json`);
            if (response.status !== StatusCodes.OK) {
                throw new Error(`Failed to fetch news: ${response?.statusText}`);
            }
            const newsData = response.data?.pageProps?.resp?.data?.content?.items;
            const validNewses = newsData?.filter((item: any) => item?.contentId !== null && item?.title)?.slice(0, 5)
            if (!newsData || !validNewses || validNewses?.length === 0) {
                throw new Error("No news data found");
            }
            const newsList: News[] = validNewses.map((item) => {
                return {
                    id: item?.contentId,
                    title: item?.title,
                    description: item?.description,
                    link: `${NewsSources.BAO_MOI}/${item?.url}`,
                    imageUrl: item?.thumb,
                    source: NewsSources.BAO_MOI,
                    publishedAt: dayjs.unix(item?.date)
                };
            })
            // Save news to Redis
            this._redisService.setCache(redisKey, newsList, TIME_CONSTANTS.REDIS_CACHE_NEWS);
            return newsList;
        }
        catch (error) {
            console.error("Error in getNewsAsync:", error);
            return null;
        }
    }
}