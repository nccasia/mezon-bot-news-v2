import { ChatCommands } from "@/constants/chat-commands";
import { ChannelMessage, MezonClient } from "mezon-sdk";
import { CommonMessagesService } from "../bot-messages/common-messages";
import { NewsMessagesService } from "../bot-messages/news-messages";

class MezonBotService {
  private client: MezonClient;
  private _commonMessagesService: CommonMessagesService;
  private _newsMessagesService: NewsMessagesService;
  constructor(CommonMessagesService: CommonMessagesService, NewsMessagesService: NewsMessagesService) {
    this.client = new MezonClient(process.env.MEZON_BOT_TOKEN);
    this.client.login().then(() => {
      console.log("Mezon Bot is ready!");
    }
    )
    this._commonMessagesService = CommonMessagesService;
    this._newsMessagesService = NewsMessagesService;
    this._commonMessagesService.injectClient(this.client);
    this._newsMessagesService.injectClient(this.client);
    this.client.onChannelMessage(this.listenChanelMessages);

  }

  public listenChanelMessages = (event: ChannelMessage) => {
    // Handle the channel message event here
    const commandMessage = event.content?.t
    if (!commandMessage || !commandMessage.startsWith("*")) {
      return;
    }
    switch (commandMessage) {
      case commandMessage.match(ChatCommands.PING)?.input:
        this._commonMessagesService.ping(event);
        break;

      case commandMessage.match(ChatCommands.HELP)?.input:
        this._commonMessagesService.help(event);
        break;

      case commandMessage.match(ChatCommands.CATEGORIES)?.input:
        this._newsMessagesService.getCategories(event);
        break;

      case commandMessage.match(ChatCommands.NEWS)?.input:
        this._newsMessagesService.getNews(event);
        break;
      default:
        break;
    }
  }
}
export default MezonBotService;
