import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import Application from "./app";
import { MezonBotService, RedisService } from "./services";
import { CommonMessagesService } from "./services/bot-messages/common-messages";
import { NewsMessagesService } from "./services/bot-messages/news-messages";
import { CrawlNewsService } from "./services/crawlers/crawl-news-service";
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Register the services
container.register({
  // Register the Services
  Application: asClass(Application).singleton(),
  RedisService: asClass(RedisService).singleton(),
  CrawlNewsService: asClass(CrawlNewsService).singleton(),
  MezonBotService: asClass(MezonBotService).singleton(),
  CommonMessagesService: asClass(CommonMessagesService).scoped(),
  NewsMessagesService: asClass(NewsMessagesService).scoped(),
});
export default container;
