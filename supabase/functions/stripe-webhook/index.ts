import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }
    logStep("Environment variables verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the raw body and signature for verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR: Missing Stripe signature");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
      });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Signature verified", { eventType: event.type, eventId: event.id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("ERROR: Signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
      });
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { 
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          metadata: session.metadata
        });

        const userId = session.metadata?.user_id;
        if (!userId) {
          logStep("ERROR: No user_id in session metadata");
          break;
        }

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get subscription details for end date
        let subscriptionEndDate: Date | null = null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          subscriptionEndDate = new Date(subscription.current_period_end * 1000);
          logStep("Subscription details retrieved", { 
            subscriptionId, 
            endDate: subscriptionEndDate.toISOString() 
          });
        }

        // Call the database function to upgrade instructor
        const { data, error } = await supabaseAdmin.rpc('upgrade_instructor_to_pro', {
          p_user_id: userId,
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: subscriptionId,
          p_subscription_end_date: subscriptionEndDate?.toISOString() || null
        });

        if (error) {
          logStep("ERROR: Failed to upgrade instructor", { error: error.message });
        } else {
          logStep("SUCCESS: Instructor upgraded to Pro", { userId, result: data });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", {
          subscriptionId: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata
        });

        const userId = subscription.metadata?.user_id;
        if (!userId) {
          logStep("No user_id in subscription metadata, skipping");
          break;
        }

        if (subscription.status === "active") {
          const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
          
          const { error } = await supabaseAdmin.rpc('upgrade_instructor_to_pro', {
            p_user_id: userId,
            p_stripe_customer_id: subscription.customer as string,
            p_stripe_subscription_id: subscription.id,
            p_subscription_end_date: subscriptionEndDate.toISOString()
          });

          if (error) {
            logStep("ERROR: Failed to update subscription", { error: error.message });
          } else {
            logStep("SUCCESS: Subscription updated", { userId });
          }
        } else if (["canceled", "unpaid", "past_due"].includes(subscription.status)) {
          const { error } = await supabaseAdmin.rpc('downgrade_instructor_to_free', {
            p_user_id: userId
          });

          if (error) {
            logStep("ERROR: Failed to downgrade instructor", { error: error.message });
          } else {
            logStep("SUCCESS: Instructor downgraded to Free", { userId, status: subscription.status });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", {
          subscriptionId: subscription.id,
          metadata: subscription.metadata
        });

        const userId = subscription.metadata?.user_id;
        if (!userId) {
          logStep("No user_id in subscription metadata, skipping");
          break;
        }

        const { error } = await supabaseAdmin.rpc('downgrade_instructor_to_free', {
          p_user_id: userId
        });

        if (error) {
          logStep("ERROR: Failed to downgrade instructor", { error: error.message });
        } else {
          logStep("SUCCESS: Instructor downgraded after subscription deletion", { userId });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription
        });

        // Optionally handle failed payments - could send notification or mark status
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR: Unhandled exception", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
