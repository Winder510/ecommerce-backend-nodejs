import express from 'express';
import accessRouter from './access/index.js';
import paymentRouter from './payment/index.js';
import discountRouter from './discount/index.js';
import cartRouter from './cart/index.js';
import checkoutRouter from './checkout/index.js';
import inventoryRouter from './inventory/index.js';
import notificationRouter from './notification/index.js';
import uploadRouter from './upload/index.js';
import profileRouter from './profile/index.js';
import rbacRouter from './rbac/index.js';
import templateRouter from './template/index.js';
import userRouter from './user/index.js';
import commentRouter from './comment/index.js';
import categoryRouter from './category/index.js';
import attributeGroupRouter from './attributeGroup/index.js';
import productRouter from './product/index.js';
import promotionRouter from './promotion/index.js';
import ESRouter from './elasticSearch/index.js';
import orderRouter from './order/index.js';




const router = express.Router();

// check apiKey

//check permission
router.use('/api/v1/order', orderRouter);
router.use('/api/v1/product', productRouter);
router.use('/api/v1/attribute', attributeGroupRouter);
router.use('/api/v1/full-text-search', ESRouter);
router.use('/api/v1/promotion', promotionRouter);
router.use('/api/v1/template', templateRouter);
router.use('/api/v1/category', categoryRouter);
router.use('/api/v1/user', userRouter);
router.use('/api/v1/rbac', rbacRouter);
router.use('/api/v1/profile', profileRouter);
router.use('/api/v1/comment', commentRouter);
router.use('/api/v1/upload', uploadRouter);
router.use('/api/v1/inventory', inventoryRouter);
router.use('/api/v1/notification', notificationRouter);
router.use('/api/v1/checkout', checkoutRouter);
router.use('/api/v1/cart', cartRouter);
router.use('/api/v1/discount', discountRouter);
router.use('/api/v1/payment', paymentRouter);
//router.use('/api/v1', passportRouter);
router.use('/api/v1/auth', accessRouter);


export default router;