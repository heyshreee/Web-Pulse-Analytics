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
            id: 'free',
            name: 'Free',
            price: 0,
            price_usd: 0,
            price_inr: 0,
            interval: 'month',
            description: 'For learning, prototypes, and personal projects.',
            features: ['1 project', '1 allowed domain per project', '1,000 tracked events / month', '60-second dashboard refresh'],
            buttonText: 'Start for free',
            limits: {
                monthlyViews: 1000,
                projectLimit: 1
            }
        },
        {
            id: 'basic',
            name: 'Basic',
            price: 299,
            price_usd: 4,
            price_inr: 299,
            interval: 'month',
            description: 'For independent developers running a few small websites.',
            features: ['5 projects', '3 allowed domains per project', '50,000 tracked events / month', '10-second dashboard refresh'],
            buttonText: 'Choose Basic',
            limits: {
                monthlyViews: 50000,
                projectLimit: 5
            }
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 999,
            price_usd: 12,
            price_inr: 999,
            interval: 'month',
            description: 'For growing products that need live activity logs and public reports.',
            features: ['15 projects', '10 allowed domains per project', '500,000 tracked events / month', '1-second dashboard refresh', 'Live activity logs', '5 public reports'],
            buttonText: 'Choose Pro',
            popular: true,
            limits: {
                monthlyViews: 500000,
                projectLimit: 15
            }
        },
        {
            id: 'business',
            name: 'Business',
            price: 2999,
            price_usd: 39,
            price_inr: 2999,
            interval: 'month',
            description: 'For high-traffic sites tracking millions of events across many projects.',
            features: ['100 projects', '100 allowed domains per project', '5,000,000 tracked events / month', '1-second dashboard refresh', '100 public reports', 'Team access (planned)'],
            buttonText: 'Choose Business',
            limits: {
                monthlyViews: 5000000,
                projectLimit: 100
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
        throw AppError.badRequest('Free plan cannot be purchased');
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
        razorpay_signature
    } = req.body;
    const userId = req.user.id;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        throw AppError.badRequest('Invalid signature');
    }

    // Idempotency: never process the same payment twice.
    const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('provider_payment_id', razorpay_payment_id)
        .maybeSingle();

    if (existingPayment) {
        return res.json({ success: true, message: 'Payment already processed' });
    }

    // Never trust the client-supplied plan: fetch the order we created and
    // derive both the owner and the plan from its server-side notes.
    let order;
    try {
        order = await razorpay.orders.fetch(razorpay_order_id);
    } catch {
        throw AppError.badRequest('Unknown Razorpay order');
    }

    const notes = order?.notes || {};
    if (notes.userId !== userId) {
        throw AppError.forbidden('Order does not belong to this user');
    }

    const verifiedPlanId = notes.planId;
    if (!verifiedPlanId || verifiedPlanId === 'free') {
        throw AppError.badRequest('Order is not associated with a purchasable plan');
    }

    // Payment verified - Update user plan
    const { error: updateError } = await supabase
        .from('users')
        .update({
            plan: verifiedPlanId
        })
        .eq('id', userId);

    if (updateError) throw updateError;

    // Store payment record
    const planLimits = getPlanLimits(verifiedPlanId);
    const amount = planLimits.amount;

    const { error: paymentError } = await supabase
        .from('payments')
        .insert({
            user_id: userId,
            amount: amount,
            currency: 'INR', // Razorpay charges in INR
            status: 'paid',
            method: 'razorpay',
            plan_id: verifiedPlanId,
            provider_payment_id: razorpay_payment_id,
            provider_order_id: razorpay_order_id,
            metadata: {
                plan: verifiedPlanId,
                order_id: razorpay_order_id
            }
        });

    if (paymentError) console.error('Failed to store payment record:', paymentError);

    // Log activity
    await ActivityLogService.log(
        null, // No project ID for user-level action
        userId,
        'subscription.upgraded',
        `Upgraded to ${verifiedPlanId} plan`,
        'success',
        req.ip,
        {
            plan: verifiedPlanId,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id
        }
    );

    // Send Payment Receipt Email
    if (req.user && req.user.email) {
        const emailPlanLimits = getPlanLimits(verifiedPlanId);
        const emailAmount = emailPlanLimits.amount;

        await EmailService.sendPaymentSuccessEmail(
            req.user.email,
            verifiedPlanId,
            emailAmount, // Amount is already in currency unit (e.g., 29), not paise
            razorpay_payment_id,
            new Date().toLocaleDateString(),
            req.user.name || 'User'
        );
    }

    res.json({ success: true, message: 'Payment verified and plan updated' });
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

    // Verify ownership against the stored payment record
    const { data: paymentRow } = await supabase
        .from('payments')
        .select('id')
        .eq('provider_payment_id', id)
        .eq('user_id', userId)
        .maybeSingle();

    if (!paymentRow) {
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

    // Verify ownership against the stored payment record
    const { data: paymentRow } = await supabase
        .from('payments')
        .select('id')
        .eq('provider_payment_id', id)
        .eq('user_id', userId)
        .maybeSingle();

    if (!paymentRow) {
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
