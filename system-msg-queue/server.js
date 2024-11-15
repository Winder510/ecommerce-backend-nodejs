import MessageService from "./src/services/consumerQueue.service.js";

MessageService.consumeSyncData().catch(console.error);
MessageService.consumeSyncDataFailed().catch(console.error);