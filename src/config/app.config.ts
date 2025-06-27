export const APP_CONFIG = {
  name: 'ArchMen',
  description: 'Understand your relationships through Jungian archetypes and shadow work',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Subscription tiers
  subscriptions: {
    free: {
      name: 'Free',
      features: [
        'Basic archetype assessment',
        'View primary archetype',
        'Basic recommendations',
        'Limited chat messages (10/month)'
      ],
      limits: {
        assessmentsPerMonth: 1,
        chatMessagesPerMonth: 10,
        coursesAccess: false
      }
    },
    monthly: {
      name: 'Monthly',
      price: 19.99,
      features: [
        'Unlimited assessments',
        'Full archetype analysis',
        'Shadow work recommendations',
        'Unlimited chat messages',
        'Access to all courses',
        'Progress tracking',
        'Email support'
      ],
      limits: {
        assessmentsPerMonth: -1, // unlimited
        chatMessagesPerMonth: -1,
        coursesAccess: true
      }
    },
    yearly: {
      name: 'Yearly',
      price: 199.99,
      features: [
        'Everything in Monthly',
        'Save 17% compared to monthly',
        'Priority support',
        'Early access to new features',
        'Downloadable resources'
      ],
      limits: {
        assessmentsPerMonth: -1,
        chatMessagesPerMonth: -1,
        coursesAccess: true
      }
    },
    lifetime: {
      name: 'Lifetime',
      price: 499.99,
      features: [
        'Everything in Yearly',
        'One-time payment',
        'Lifetime updates',
        'VIP support',
        'Personal consultation session'
      ],
      limits: {
        assessmentsPerMonth: -1,
        chatMessagesPerMonth: -1,
        coursesAccess: true
      }
    }
  },

  // AI Chat configuration
  ai: {
    model: 'gpt-4-turbo-preview',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: `You are a knowledgeable guide specializing in Jungian psychology, specifically masculine archetypes and shadow work in relationships. 
    Your role is to help men understand their relationship patterns through the lens of archetypes like the King, Warrior, Magician, Lover, Hero, Sage, Jester, and Caregiver.
    Be empathetic, non-judgmental, and focus on growth and self-awareness. Use clear, accessible language while maintaining psychological accuracy.`
  },

  // Assessment configuration
  assessment: {
    minQuestions: 20,
    maxQuestions: 40,
    timeoutMinutes: 60,
    scoringThresholds: {
      dominant: 0.7, // 70% or higher makes it dominant
      secondary: 0.5, // 50% or higher makes it secondary
      present: 0.3    // 30% or higher means the archetype is present
    }
  },

  // SEO
  seo: {
    defaultTitle: 'ArchMen - Jungian Archetypes for Men\'s Relationships',
    titleTemplate: '%s | ArchMen',
    defaultDescription: 'Discover your masculine archetypes and shadow patterns to improve your relationships through Jungian psychology and personalized insights.',
    keywords: [
      'jungian archetypes',
      'shadow work',
      'mens relationships',
      'masculine psychology',
      'relationship patterns',
      'self improvement',
      'carl jung',
      'personality assessment'
    ]
  }
} as const 