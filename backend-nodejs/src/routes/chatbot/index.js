import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import ChatBotController from '../../controllers/chatbot.controller.js';

const router = express.Router();
router.post('', asyncErrorHandler(ChatBotController.getAIChatResponse));


export default router;