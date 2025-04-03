import {
    GoogleGenerativeAI
} from "@google/generative-ai";
import {
    SpuService
} from "./spu.service.js";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class ChatBotService {
    static chatHistory = [];

    static async getAIChat({
        userMessage
    }) {
        try {
            // Lấy danh sách sản phẩm
            const response = await SpuService.findAllPublishSpu({
                limit: 1000,
                page: 1
            });
            const allProducts = response?.products || [];
            if (allProducts.length === 0) {
                return {
                    reply: "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp."
                };
            }

            // Lọc sản phẩm liên quan (giả sử dựa trên từ khóa trong userMessage)
            const keywords = userMessage.toLowerCase().split(" ");
            const relevantProducts = allProducts.filter(p =>
                keywords.some(k => p.product_name.toLowerCase().includes(k) ||
                    p.product_description.toLowerCase().includes(k))
            ).slice(0, 10); // Giới hạn 10 sản phẩm để tránh quá tải

            const productInfo = relevantProducts.length > 0 ?
                relevantProducts
                .map(p => `${p.product_name}: ${p.product_description} - Giá: ${p.product_price} VND`)
                .join("\n") :
                "Không tìm thấy sản phẩm phù hợp với yêu cầu.";

            // Thêm tin nhắn người dùng vào lịch sử
            this.chatHistory.push({
                role: "user",
                content: userMessage
            });
            if (this.chatHistory.length > 10) {
                this.chatHistory.shift();
            }

            // Định dạng lịch sử hội thoại
            const formattedHistory = [{
                    role: "user",
                    parts: [{
                        text: `Bạn là một trợ lý bán hàng. Hãy trả lời ngắn gọn, hữu ích dựa trên thông tin sản phẩm và câu hỏi của người dùng. Đây là danh sách sản phẩm: ${productInfo}`
                    }]
                },
                ...this.chatHistory.map(msg => ({
                    role: msg.role,
                    parts: [{
                        text: msg.content
                    }]
                }))
            ];

            console.log("🚀 ~ ChatBotService ~ formattedHistory:", formattedHistory)


            // Gọi Gemini API
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash"
            });

            const result = await model.generateContent({
                contents: formattedHistory
            });

            const responseText = result.response?.text()?.trim();

            if (!responseText) {
                return {
                    reply: "Xin lỗi, tôi không thể trả lời ngay lúc này."
                };
            }

            this.chatHistory.push({
                role: "model",
                content: responseText
            });

            return {
                reply: responseText
            };

        } catch (error) {
            console.error("Lỗi khi gọi AI:", error);
            return {
                reply: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn."
            };
        }
    }
}