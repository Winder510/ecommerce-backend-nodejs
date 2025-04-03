import {
    SuccessResponse
} from '../core/success.response.js';
import {
    ChatBotService
} from '../services/chatbot.service.js';

class ChatBotController {
    static async getAIChatResponse(req, res, next) {
        new SuccessResponse({
            message: 'Get ai chat successfully',
            metadata: await ChatBotService.getAIChat(req.body),
        }).send(res);
    }
}

export default ChatBotController;