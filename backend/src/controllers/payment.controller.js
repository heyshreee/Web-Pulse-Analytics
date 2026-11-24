import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import ActivityLogService from '../services/activity.service.js';
import { getPlanLimits } from '../services/usage.service.js';
import EmailService from '../services/email.service.js';
import ReceiptService from '../services/receipt.service.js';
import PDFDocument from 'pdfkit';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../errors/AppError.js';

export const getPlans = asyncHandler(async (req, res) => {
    const plans = [
        {
            id: 'nano',
            name: 'Nano',
            price: 0,
            price_usd: 0,
            price_inr: 0,
            interval: 'month',
            description: 'Entry-level analytics for personal websites and testing.',
            features: ['1 Project', '1 Allowed Origin', '10,000 events/mo', '7-day data retention', '60 sec refresh', 'Basic API access'],
            buttonText: 'Start Free',
            limits: {
                monthlyViews: 10000,
                projectLimit: 1,
                allowedOriginsLimit: 1,
                retentionDays: 7,
                refreshRate: 60
            }
        },
        {
            id: 'lite',
            name: 'Lite',
            price: 199,
            price_usd: 2.49,
            price_inr: 199,
            interval: 'month',
            description: 'Affordable analytics for individual developers and small websites.',
            features: ['3 Projects', '3 Allowed Origins', '100,000 events/mo', '30-day data retention', '15 sec refresh', 'Basic API access', 'Limited CSV export'],
            buttonText: 'Choose Lite',
            limits: {
                monthlyViews: 100000,
                projectLimit: 3,
                allowedOriginsLimit: 3,
                retentionDays: 30,
                refreshRate: 15
            }
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 699,
            price_usd: 8.99,
            price_inr: 699,
            interval: 'month',
            description: 'Advanced analytics, API access and V2 beta access.',
            features: ['10 Projects', '10 Allowed Origins', '1,000,000 events/mo', '90-day data retention', '5 sec refresh', '3 Team members', 'Live event logs', 'Full Analytics API', 'Advanced exports', 'V2 Beta access'],
            buttonText: 'Choose Pro',
            popular: true,
            limits: {
                monthlyViews: 1000000,
                projectLimit: 10,
                allowedOriginsLimit: 10,
                retentionDays: 90,
                refreshRate: 5
            }
        },
        {
            id: 'max',
            name: 'Max',
            price: 1999,
            price_usd: 24.99,
            price_inr: 1999,
            interval: 'month',
            description: 'Full analytics capabilities, beta and invitation-only alpha access.',
            features: ['50 Projects', '25 Allowed Origins', '5,000,000 events/mo', '12-month data retention', '1 sec refresh', '10 Team members', 'Unlimited saved reports', 'Live event logs', 'Full Analytics API', 'V2 Beta & Alpha access'],
            buttonText: 'Choose Max',
            limits: {
                monthlyViews: 5000000,
                projectLimit: 50,
                allowedOriginsLimit: 25,
                retentionDays: 365,
                refreshRate: 1
            }
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'custom',
            price_usd: 'custom',
            price_inr: 'custom',
            interval: 'month',
            description: 'For companies requiring custom capacity, security and support.',
            features: ['Negotiated event capacity', 'Custom projects & domains', 'Custom data retention', 'Dedicated dashboard refresh', 'Role-based access & SSO', 'Priority support & SLA'],
            buttonText: 'Contact Sales',
            limits: {
                monthlyViews: 'custom',
                projectLimit: 'custom',
                allowedOriginsLimit: 'custom',
                retentionDays: 'custom',
                refreshRate: 1
            }
        }
    ];

    res.json(plans);
});

export const createOrder = asyncHandler(async (req, res) => {
    const { planId } = req.body;
    const userId = req.user.id;

    const planLimits = getPlanLimits(planId);
    const amount = planLimits.amount;

    if (amount === 'custom' || amount === undefined) {
        throw AppError.badRequest('Invalid plan or custom pricing required');
    }

    if (amount === 0) {
        throw AppError.badRequest('Nano plan cannot be purchased');
    }

    console.log('Creating order for:', { userId, planId, amount });

    const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-10)}_${Math.floor(Math.random() * 1000)}`,
        notes: {
            userId,
            planId
        }
    };

    const order = await razorpay.orders.create(options);

    res.json({
        success: true,
        order
    });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planId
    } = req.body;
    const userId = req.user.id;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Payment verified - Update user plan
        const { error: updateError } = await supabase
            .from('users')
            .update({
                plan: planId
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        // Store payment record
        const planLimits = getPlanLimits(planId);
        const amount = planLimits.amount;

        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                amount: amount,
                currency: 'USD', // Or INR based on Razorpay config
                status: 'paid',
                method: 'razorpay',
                plan_id: planId,
                provider_payment_id: razorpay_payment_id,
                provider_order_id: razorpay_order_id,
                metadata: {
                    plan: planId,
                    order_id: razorpay_order_id
                }
            });

        if (paymentError) console.error('Failed to store payment record:', paymentError);

        // Log activity
        await ActivityLogService.log(
            null, // No project ID for user-level action
            userId,
            'subscription.upgraded',
            `Upgraded to ${planId} plan`,
            'success',
            req.ip,
            {
                plan: planId,
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id
            }
        );

        // Send Payment Receipt Email
        if (req.user && req.user.email) {
            const planLimits = getPlanLimits(planId);
            const amount = planLimits.amount;

            await EmailService.sendPaymentSuccessEmail(
                req.user.email,
                planId,
                amount, // Amount is already in currency unit (e.g., 29), not paise
                razorpay_payment_id,
                new Date().toLocaleDateString(),
                req.user.name || 'User'
            );
        }

        res.json({ success: true, message: 'Payment verified and plan updated' });
    } else {
        throw AppError.badRequest('Invalid signature');
    }
});

export const getPaymentHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Fetch payments from payments table
    const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const history = payments.map(payment => ({
        id: payment.provider_payment_id || payment.id,
        date: payment.created_at,
        amount: payment.amount,
        plan: payment.plan_id,
        status: payment.status,
        description: `Subscription - ${payment.plan_id} Plan`
    }));

    res.json(history);
});

export const getReceipt = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(id);

    if (!payment) {
        throw AppError.notFound('Payment not found');
    }

    // Verify ownership via email (Razorpay stores email) or check if it exists in user's activity logs
    // For stricter security, check if this payment_id exists in user's activity logs
    const { data: log } = await supabase
        .from('activity_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('action', 'subscription.upgraded')
        .contains('metadata', { payment_id: id })
        .single();

    if (!log) {
        throw AppError.forbidden('Access denied to this receipt');
    }

    const user = {
        name: req.user.name,
        email: req.user.email
    };

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${id}.pdf`);

    ReceiptService.generateReceipt(payment, user, res);
});

export const downgradePlan = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { planId } = req.body; // Should be 'free'

    if (planId !== 'free') {
        throw AppError.badRequest('Invalid plan for downgrade');
    }

    // Update user plan
    const { error } = await supabase
        .from('users')
        .update({ plan: 'free' })
        .eq('id', userId);

    if (error) throw error;

    // Log activity
    await ActivityLogService.log(
        null,
        userId,
        'subscription.downgraded',
        'Downgraded to Free plan',
        'warning',
        req.ip,
        {
            plan: 'free'
        }
    );

    // Send Email
    if (req.user && req.user.email) {
        EmailService.sendPlanDowngradedEmail(
            req.user.email,
            'Free',
            new Date().toLocaleDateString(),
            req.user.name || 'User'
        ).catch(console.error);
    }

    res.json({ success: true, message: 'Plan downgraded successfully' });
});

export const emailReceipt = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(id);

    if (!payment) {
        throw AppError.notFound('Payment not found');
    }

    // Verify ownership
    const { data: log } = await supabase
        .from('activity_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('action', 'subscription.upgraded')
        .contains('metadata', { payment_id: id })
        .single();

    if (!log) {
        throw AppError.forbidden('Access denied to this receipt');
    }

    const user = {
        name: req.user.name,
        email: req.user.email
    };

    // Generate PDF Buffer
    const buffers = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);

        // Send Email
        await EmailService.sendReceiptEmail(
            user.email,
            pdfBuffer,
            id,
            user.name || 'User'
        );

        res.json({ success: true, message: 'Receipt sent to email' });
    });

    const pdfBuffer = await ReceiptService.generatePDFBuffer(payment, user);

    await EmailService.sendReceiptEmail(
        user.email,
        pdfBuffer,
        id,
        user.name || 'User'
    );

    res.json({ success: true, message: 'Receipt sent to email' });
});

export default { getPlans, createOrder, verifyPayment, getPaymentHistory, getReceipt, downgradePlan, emailReceipt };
