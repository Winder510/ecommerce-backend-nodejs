import MessageService from "./src/services/consumerQueue.service.js";
import './src/dbs/init.mongo.js';
MessageService.consumeSyncData().catch(console.error);
MessageService.consumeSyncDataFailed().catch(console.error);
// MessageService.consumeNotification().catch(console.error);
// MessageService.consumeNotificationFailed().catch(console.error);