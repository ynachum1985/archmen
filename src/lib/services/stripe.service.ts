import Stripe from 'stripe'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { APP_CONFIG } from '@/config/app.config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export class StripeService {
  async createCheckoutSession({
    userId,
    priceId,
    subscriptionType,
    successUrl,
    cancelUrl,
  }: {
    userId: string
    priceId: string
    subscriptionType: 'monthly' | 'yearly' | 'lifetime'
    successUrl: string
    cancelUrl: string
  }) {
    const supabase = await createServerClient()
    const profileRepo = new ProfileRepository(supabase)
    const profile = await profileRepo.findById(userId)

    if (!profile) throw new Error('Profile not found')

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id

      // Update profile with Stripe customer ID
      await profileRepo.update(userId, {
        stripe_customer_id: customerId,
      })
    }

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        subscriptionType,
      },
    }

    if (subscriptionType === 'lifetime') {
      // One-time payment
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ]
    } else {
      // Subscription
      sessionConfig.mode = 'subscription'
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ]
      sessionConfig.subscription_data = {
        metadata: {
          userId,
          subscriptionType,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    return session
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session
  }

  async handleWebhook(payload: string, signature: string) {
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      throw new Error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    const supabase = await createServerClient()
    const profileRepo = new ProfileRepository(supabase)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const subscriptionType = session.metadata?.subscriptionType

        if (!userId) break

        if (session.mode === 'payment' && subscriptionType === 'lifetime') {
          // Handle lifetime payment
          await profileRepo.update(userId, {
            subscription_status: 'lifetime',
            subscription_end_date: null, // No end date for lifetime
          })
        } else if (session.mode === 'subscription') {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await profileRepo.update(userId, {
            subscription_status: subscriptionType as 'monthly' | 'yearly',
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) break

        // Check if subscription is active
        if (subscription.status === 'active') {
          const subscriptionType = subscription.metadata?.subscriptionType as 'monthly' | 'yearly'
          
          await profileRepo.update(userId, {
            subscription_status: subscriptionType,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) break

        // Subscription cancelled
        await profileRepo.update(userId, {
          subscription_status: 'free',
          subscription_end_date: null,
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Find user by Stripe customer ID
        const profile = await profileRepo.findByStripeCustomerId(customerId)
        
        if (profile) {
          // You might want to send an email notification here
          console.log(`Payment failed for user ${profile.id}`)
        }
        break
      }
    }

    return { received: true }
  }

  async cancelSubscription(customerId: string) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    })

    if (subscriptions.data.length > 0) {
      // Cancel the subscription at period end
      await stripe.subscriptions.update(subscriptions.data[0].id, {
        cancel_at_period_end: true,
      })
    }
  }

  async getSubscriptionStatus(customerId: string) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    })

    if (subscriptions.data.length === 0) {
      return null
    }

    const subscription = subscriptions.data[0]
    return {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  }
} 