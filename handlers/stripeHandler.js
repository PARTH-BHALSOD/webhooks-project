/**
 * Stripe Webhook Handler
 *
 * Handles common Stripe webhook events for payments, subscriptions, and customers.
 * Each event type routes to its specific handler function.
 */

const stripeHandler = async (webhookEvent) => {
    console.log(`[Stripe Handler] Processing event: ${webhookEvent.eventType}`);
    console.log(`[Stripe Handler] Event ID: ${webhookEvent.eventId}`);

    const { eventType, payload } = webhookEvent;

    try {
        let result;

        // Route to appropriate handler based on event type
        switch (eventType) {
            // Payment Intent Events
            case 'payment_intent.succeeded':
                result = await handlePaymentIntentSucceeded(payload);
                break;

            case 'payment_intent.payment_failed':
                result = await handlePaymentIntentFailed(payload);
                break;

            // Charge Events
            case 'charge.succeeded':
                result = await handleChargeSucceeded(payload);
                break;

            case 'charge.failed':
                result = await handleChargeFailed(payload);
                break;

            case 'charge.refunded':
                result = await handleChargeRefunded(payload);
                break;

            // Subscription Events
            case 'customer.subscription.created':
                result = await handleSubscriptionCreated(payload);
                break;

            case 'customer.subscription.updated':
                result = await handleSubscriptionUpdated(payload);
                break;

            case 'customer.subscription.deleted':
                result = await handleSubscriptionDeleted(payload);
                break;

            // Invoice Events
            case 'invoice.payment_succeeded':
                result = await handleInvoicePaymentSucceeded(payload);
                break;

            case 'invoice.payment_failed':
                result = await handleInvoicePaymentFailed(payload);
                break;

            // Customer Events
            case 'customer.created':
                result = await handleCustomerCreated(payload);
                break;

            case 'customer.updated':
                result = await handleCustomerUpdated(payload);
                break;

            case 'customer.deleted':
                result = await handleCustomerDeleted(payload);
                break;

            default:
                console.log(`[Stripe Handler] Unhandled event type: ${eventType}`);
                result = {
                    success: true,
                    message: `Event type ${eventType} received but not handled`
                };
        }

        console.log(`[Stripe Handler] Successfully processed ${eventType}`);
        return result;

    } catch (error) {
        console.error(`[Stripe Handler] Error processing ${eventType}:`, error);
        throw error; // Re-throw to trigger retry mechanism
    }
};

// ============================================================================
// PAYMENT INTENT HANDLERS
// ============================================================================

/**
 * Handle successful payment intent
 * Triggered when a payment is successfully completed
 */
async function handlePaymentIntentSucceeded(event) {
    const paymentIntent = event.data.object;

    console.log(`[Payment Success] Amount: $${paymentIntent.amount / 100}`);
    console.log(`[Payment Success] Customer: ${paymentIntent.customer}`);
    console.log(`[Payment Success] Payment Intent ID: ${paymentIntent.id}`);

    // Extract metadata (custom data you attached when creating the payment)
    const metadata = paymentIntent.metadata || {};
    console.log(`[Payment Success] Metadata:`, metadata);

    // TODO: Implement your business logic here
    // Examples:
    // 1. Update order status in your database
    // 2. Grant access to purchased content (course, ebook, etc.)
    // 3. Send confirmation email to customer
    // 4. Update customer credits/balance
    // 5. Trigger fulfillment process (ship product, provision account)
    // 6. Log transaction for accounting

    // Example business logic structure:
    /*
    if (metadata.productType === 'course') {
        await grantCourseAccess({
            customerId: paymentIntent.customer,
            courseId: metadata.courseId,
            amount: paymentIntent.amount / 100
        });

        await sendConfirmationEmail({
            to: metadata.customerEmail,
            subject: 'Course Access Granted',
            courseId: metadata.courseId
        });
    }
    */

    return {
        success: true,
        message: 'Payment intent succeeded',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
    };
}

/**
 * Handle failed payment intent
 * Triggered when a payment fails
 */
async function handlePaymentIntentFailed(event) {
    const paymentIntent = event.data.object;

    console.log(`[Payment Failed] Payment Intent ID: ${paymentIntent.id}`);
    console.log(`[Payment Failed] Failure reason: ${paymentIntent.last_payment_error?.message}`);

    const metadata = paymentIntent.metadata || {};

    // TODO: Implement your business logic here
    // Examples:
    // 1. Notify customer of payment failure
    // 2. Update order status to 'failed'
    // 3. Send email with retry instructions
    // 4. Log for manual follow-up

    return {
        success: true,
        message: 'Payment intent failed notification processed',
        paymentIntentId: paymentIntent.id
    };
}

// ============================================================================
// CHARGE HANDLERS
// ============================================================================

async function handleChargeSucceeded(event) {
    const charge = event.data.object;

    console.log(`[Charge Success] Charge ID: ${charge.id}`);
    console.log(`[Charge Success] Amount: $${charge.amount / 100}`);

    // TODO: Log successful charge for accounting/analytics

    return {
        success: true,
        message: 'Charge succeeded',
        chargeId: charge.id
    };
}

async function handleChargeFailed(event) {
    const charge = event.data.object;

    console.log(`[Charge Failed] Charge ID: ${charge.id}`);
    console.log(`[Charge Failed] Failure message: ${charge.failure_message}`);

    // TODO: Alert team, log for manual review

    return {
        success: true,
        message: 'Charge failure logged',
        chargeId: charge.id
    };
}

async function handleChargeRefunded(event) {
    const charge = event.data.object;

    console.log(`[Charge Refunded] Charge ID: ${charge.id}`);
    console.log(`[Charge Refunded] Refund Amount: $${charge.amount_refunded / 100}`);

    // TODO: Implement your business logic here
    // Examples:
    // 1. Revoke access to purchased content
    // 2. Update order status to 'refunded'
    // 3. Notify customer of refund
    // 4. Update accounting records

    return {
        success: true,
        message: 'Refund processed',
        chargeId: charge.id,
        refundAmount: charge.amount_refunded / 100
    };
}

// ============================================================================
// SUBSCRIPTION HANDLERS
// ============================================================================

async function handleSubscriptionCreated(event) {
    const subscription = event.data.object;

    console.log(`[Subscription Created] Subscription ID: ${subscription.id}`);
    console.log(`[Subscription Created] Customer: ${subscription.customer}`);
    console.log(`[Subscription Created] Plan: ${subscription.items.data[0]?.price?.id}`);

    // TODO: Implement your business logic here
    // Examples:
    // 1. Create subscription record in your database
    // 2. Send welcome email to customer
    // 3. Enable premium features for customer
    // 4. Set up billing cycle reminders

    return {
        success: true,
        message: 'Subscription created',
        subscriptionId: subscription.id
    };
}

async function handleSubscriptionUpdated(event) {
    const subscription = event.data.object;

    console.log(`[Subscription Updated] Subscription ID: ${subscription.id}`);
    console.log(`[Subscription Updated] Status: ${subscription.status}`);

    // TODO: Implement your business logic here
    // Examples:
    // 1. Update subscription status in database
    // 2. Handle plan changes (upgrade/downgrade)
    // 3. Adjust feature access based on new plan
    // 4. Notify customer of changes

    return {
        success: true,
        message: 'Subscription updated',
        subscriptionId: subscription.id,
        status: subscription.status
    };
}

async function handleSubscriptionDeleted(event) {
    const subscription = event.data.object;

    console.log(`[Subscription Deleted] Subscription ID: ${subscription.id}`);
    console.log(`[Subscription Deleted] Customer: ${subscription.customer}`);

    // TODO: Implement your business logic here
    // Examples:
    // 1. Revoke premium access
    // 2. Downgrade customer to free plan
    // 3. Send cancellation confirmation
    // 4. Update database to reflect cancellation

    return {
        success: true,
        message: 'Subscription cancellation processed',
        subscriptionId: subscription.id
    };
}

// ============================================================================
// INVOICE HANDLERS
// ============================================================================

async function handleInvoicePaymentSucceeded(event) {
    const invoice = event.data.object;

    console.log(`[Invoice Paid] Invoice ID: ${invoice.id}`);
    console.log(`[Invoice Paid] Amount: $${invoice.amount_paid / 100}`);
    console.log(`[Invoice Paid] Subscription: ${invoice.subscription}`);

    // TODO: Implement your business logic here
    // Examples:
    // 1. Send receipt to customer
    // 2. Extend subscription period
    // 3. Log for accounting
    // 4. Update billing history

    return {
        success: true,
        message: 'Invoice payment succeeded',
        invoiceId: invoice.id,
        amount: invoice.amount_paid / 100
    };
}

async function handleInvoicePaymentFailed(event) {
    const invoice = event.data.object;

    console.log(`[Invoice Failed] Invoice ID: ${invoice.id}`);
    console.log(`[Invoice Failed] Subscription: ${invoice.subscription}`);
    console.log(`[Invoice Failed] Attempt Count: ${invoice.attempt_count}`);

    // TODO: Implement your business logic here
    // Examples:
    // 1. Notify customer of failed payment
    // 2. Send email with payment update instructions
    // 3. Suspend account after X failed attempts
    // 4. Alert team for manual follow-up

    return {
        success: true,
        message: 'Invoice payment failure handled',
        invoiceId: invoice.id,
        attemptCount: invoice.attempt_count
    };
}

// ============================================================================
// CUSTOMER HANDLERS
// ============================================================================

async function handleCustomerCreated(event) {
    const customer = event.data.object;

    console.log(`[Customer Created] Customer ID: ${customer.id}`);
    console.log(`[Customer Created] Email: ${customer.email}`);

    // TODO: Sync customer data to your database

    return {
        success: true,
        message: 'Customer created',
        customerId: customer.id
    };
}

async function handleCustomerUpdated(event) {
    const customer = event.data.object;

    console.log(`[Customer Updated] Customer ID: ${customer.id}`);

    // TODO: Update customer data in your database

    return {
        success: true,
        message: 'Customer updated',
        customerId: customer.id
    };
}

async function handleCustomerDeleted(event) {
    const customer = event.data.object;

    console.log(`[Customer Deleted] Customer ID: ${customer.id}`);

    // TODO: Handle customer deletion in your database

    return {
        success: true,
        message: 'Customer deletion processed',
        customerId: customer.id
    };
}

export default stripeHandler;
