import Stripe from 'stripe';
import dotenv from 'dotenv';
import {
    OrderService
} from './order.service.js';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class PaymentService {
    // static async processPayment({
    //     amount,
    //     paymentMethodId
    // }) {
    //     try {
    //         const paymentIntent = await stripe.paymentIntents.create({
    //             amount: 2000,
    //             currency: 'usd',
    //             automatic_payment_methods: {
    //                 enabled: true,
    //             },
    //             confirm: true,
    //             return_url: "http://localhost:8000/api/v1/"
    //         });

    //         return {
    //             success: true,
    //             paymentIntent
    //         };
    //     } catch (error) {
    //         return {
    //             success: false,
    //             error: error.message
    //         };
    //     }
    // }

    // Tạo intent thanh toán
    static async createCheckoutSession({
        amount = 1000000,
    }) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'vnd',
                        unit_amount: amount,
                        product_data: {
                            name: 'Thanh toán đơn hàng',
                        },
                    },
                    quantity: 1,
                }, ],
                mode: 'payment',
                success_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/cancel',
            });

            return {
                url: session.url,
            };
        } catch (error) {
            console.error('Stripe Payment Intent Error:', error);
            throw new Error('Không thể tạo thanh toán');
        }
    }

    static async handleWebhook(req) {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            await OrderService.handleStripeWebhook(event);
            res.json({
                received: true
            });
        } catch (error) {
            res.status(500).send(`Webhook handler failed: ${error.message}`);
        }
    }


    // async handleStripeWebhook(req, res) {
    //     const sig = req.headers['stripe-signature'];
    //     const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    //     if (event.type === 'payment_intent.succeeded') {
    //         const paymentIntent = event.data.object;

    //         // Update order status
    //         await orderModel.findOneAndUpdate({
    //             'order_payment.payment_intent_id': paymentIntent.id
    //         }, {
    //             $set: {
    //                 'order_payment.status': 'succeeded',
    //                 'order_status': 'confirmed'
    //             }
    //         });
    //     }

    //     if (event.type === 'payment_intent.payment_failed') {
    //         const paymentIntent = event.data.object;

    //         // Revert inventory and update order status
    //         const order = await orderModel.findOne({
    //             'order_payment.payment_intent_id': paymentIntent.id
    //         });

    //         if (order) {
    //             await Promise.all([
    //                 // Revert inventory
    //                 ...order.order_products.map(({
    //                         productId,
    //                         quantity
    //                     }) =>
    //                     ProductService.increaseInventory(productId, quantity)
    //                 ),
    //                 // Update order status
    //                 orderModel.findByIdAndUpdate(order._id, {
    //                     $set: {
    //                         'order_payment.status': 'failed',
    //                         'order_status': 'cancelled'
    //                     }
    //                 })
    //             ]);
    //         }
    //     }

    //     res.json({
    //         received: true
    //     });
    // }

}