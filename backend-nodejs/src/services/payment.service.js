import Stripe from 'stripe';
import dotenv from 'dotenv';
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
        try {
            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object;
                    console.log('Thanh toán thành công:', session);
                    break;

                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    console.log('PaymentIntent thành công:', paymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object;
                    console.error('Thanh toán thất bại:', failedPayment);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

        } catch (err) {
            console.error('Webhook Error:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

}