import { NewsCategories } from "@/constants/news-categories";
import { ChannelMessage, IEmbedProps, MezonClient } from "mezon-sdk";
import { CrawlNewsService } from "../crawlers/crawl-news-service";

export class NewsMessagesService {
    private client: MezonClient;
    private _crawlNewsService: CrawlNewsService;

    constructor(CrawlNewsService: CrawlNewsService) {
        this._crawlNewsService = CrawlNewsService;
    }
    public injectClient(client: MezonClient): void {
        this.client = client;
    }

    public getCategories = (event: ChannelMessage): void => {
        const currentChannel = this.client.channels.get(event.channel_id);
        const comingMessage = currentChannel.messages.get(event.message_id);
        const replyMessage = NewsCategories.map((category) => {
            return `- ${category.name}: ${category.slug}`;
        }).join("\n");
        if (comingMessage) {
            comingMessage.reply({
                t: replyMessage,
            });
            return;
        }
        currentChannel.send({
            t: replyMessage,
        });
    }
    public getNews = async (event: ChannelMessage): Promise<void> => {
        const currentChannel = this.client.channels.get(event.channel_id);
        const comingMessage = currentChannel.messages.get(event.message_id);
        const categorySlug = event.content?.t?.split(" ")[1];
        const category = NewsCategories.find((cat) => cat.slug === categorySlug.trim());
        if (!category) {
            currentChannel.send({
                t: `Danh mục không hợp lệ! Vui lòng kiểm tra lại cú pháp hoặc tham khảo danh sách danh mục bằng lệnh *categories`,
            });
            return;
        }
        const newsList = await this._crawlNewsService.getNewsByCategory(category.slug);
        if (!newsList || newsList.length === 0) {
            comingMessage.reply({
                t: `Không có tin tức nào thuộc danh mục ${category.name}`,
            });
            return;
        }
        const embedMessages: IEmbedProps[] = newsList.map((news) => {
            return {
                title: news?.title,
                description: news?.description,
                url: news?.link,
                image: {
                    url: news?.imageUrl,
                },
                footer: {
                    text: `Nguồn: ${news.source}`,
                },
                timestamp: new Date(news.publishedAt).toISOString(),
            };
        })
        if (comingMessage) {
            comingMessage.reply({
                embed: embedMessages,
            });
            return;
        }
        currentChannel.send({
            embed: embedMessages,
        }); 1
    }
}