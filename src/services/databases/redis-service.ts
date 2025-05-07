import { isJSON } from "class-validator";
import { RedisOptions, Redis } from "ioredis";

export default class RedisService {
    private redisClient: Redis
    private redisConnected: boolean = false;
    private retryCount: number = 0;
    private maxRetries: number = 10;
    private reconnectInterval: number = 2000;
    private timeoutId: NodeJS.Timeout | null = null;
    constructor() {
        this.redisClient = new Redis(process.env.REDIS_URL);
    }
    async setCache<T>(cacheKey: string, value: T, expireTime?: number) {
        const cacheValue =
            typeof value === 'string' ? value : JSON.stringify(value);
        if (expireTime) {
            await this.redisClient.set(cacheKey, cacheValue, 'EX', expireTime);
            return;
        }
        await this.redisClient.set(cacheKey, cacheValue);
    }

    async getCache(cacheKey: string) {
        const cacheData = await this.redisClient.get(cacheKey);
        return cacheData ? JSON.parse(cacheData) : null;
    }

    async deleteCache(cacheKey: string) {
        return await this.redisClient.del(cacheKey);
    }

    async addToSet<T>(setKey: string, value: T) {
        const cacheValue =
            typeof value === 'string' ? value : JSON.stringify(value);
        await this.redisClient.sadd(setKey, cacheValue);
    }

    async getSetMembers(setKey: string) {
        const data = await this.redisClient.smembers(setKey);
        return data
            ? data.map((item) => (isJSON(item) ? JSON.parse(item) : item))
            : null;
    }

    async removeFromSet(setKey: string, value: string) {
        return this.redisClient.srem(setKey, value);
    }
}
