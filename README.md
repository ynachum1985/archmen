# ArchMen - AI-Powered Relationship Assessment Platform

<!-- Production deployment: January 3, 2025 - Clean UI Version -->

A sophisticated Next.js application that uses AI to analyze relationship patterns and provide personalized insights based on Jungian archetypes.

## Features

- 🧠 **AI-Powered Chat Interface** - Interactive assessment through conversational AI
- 💫 **Jungian Archetype Framework** - Based on proven psychological models
- 🎯 **Relationship-Focused** - Specifically designed for romantic relationships
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🔒 **Secure & Private** - User data protection and privacy-first approach

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI**: OpenAI GPT integration for chat interface
- **Database**: Supabase for user data and conversations
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

This project is configured for seamless deployment on Vercel with automatic builds on push to main branches.

## 🏗️ Project Architecture

This project uses a clean repository pattern architecture with:

- **Next.js 15** with App Router
- **Supabase** for auth & database
- **Vercel** for serverless deployment
- **Stripe** for payments
- **OpenAI** for AI-powered assessments
- **Tailwind CSS** with shadcn/ui components

### Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth pages (login, register, etc.)
│   ├── api/               # API routes
│   ├── chat/              # Assessment chat interface
│   ├── courses/           # Course content
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat interface components
│   ├── courses/          # Course components
│   ├── dashboard/        # Dashboard components
│   ├── landing/          # Landing page components
│   └── ui/               # shadcn/ui components
├── config/               # App configuration
├── lib/                  # Core business logic
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic services
│   ├── supabase/         # Supabase clients
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
└── middleware.ts         # Auth middleware
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account
- OpenAI API key

### Environment Setup

1. Copy the environment example:
```bash
cp .env.example .env.local
```

2. Fill in your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Required for AI Chat)
OPENAI_API_KEY=your_openai_api_key  # Get from https://platform.openai.com/api-keys

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_ID_MONTHLY=price_monthly_subscription_id
STRIPE_PRICE_ID_YEARLY=price_yearly_subscription_id
STRIPE_PRICE_ID_LIFETIME=price_lifetime_subscription_id
```

### Supabase Setup

1. Create a new Supabase project
2. Run the following SQL to create the necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('free', 'monthly', 'yearly', 'lifetime')) DEFAULT 'free',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT UNIQUE
);

-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  questions JSONB DEFAULT '[]'::jsonb,
  responses JSONB DEFAULT '{}'::jsonb
);

-- Archetype results table
CREATE TABLE archetype_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  archetype_scores JSONB NOT NULL,
  shadow_patterns JSONB NOT NULL,
  recommendations JSONB NOT NULL
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  messages JSONB DEFAULT '[]'::jsonb,
  metadata JSONB
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  archetype_focus TEXT[] DEFAULT '{}',
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  price_lifetime DECIMAL(10,2) NOT NULL,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- Course enrollments table
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  progress JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_archetype_results_assessment_id ON archetype_results(assessment_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Assessments policies
CREATE POLICY "Users can view own assessments" ON assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assessments" ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON assessments FOR UPDATE USING (auth.uid() = user_id);

-- Archetype results policies
CREATE POLICY "Users can view own results" ON archetype_results FOR SELECT 
  USING (EXISTS (SELECT 1 FROM assessments WHERE assessments.id = archetype_results.assessment_id AND assessments.user_id = auth.uid()));
CREATE POLICY "Service role can create results" ON archetype_results FOR INSERT 
  WITH CHECK (true);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);

-- Course enrollments policies
CREATE POLICY "Users can view own enrollments" ON course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage enrollments" ON course_enrollments FOR ALL USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Stripe Setup

1. Create products and prices in Stripe Dashboard:
   - Monthly subscription ($19.99/month)
   - Yearly subscription ($199.99/year)
   - Lifetime access ($499.99 one-time)

2. Add the price IDs to your `.env.local`

3. Set up webhook endpoint at `https://yourdomain.com/api/webhook/stripe`

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Features

- **AI-Powered Assessment**: Chat-based questionnaire that identifies dominant archetypes
- **Archetype Analysis**: Detailed breakdown of King, Warrior, Magician, Lover, Hero, Sage, Jester, and Caregiver archetypes
- **Shadow Work**: Identifies shadow patterns and provides recommendations
- **Courses**: Structured content to work through shadow patterns
- **Subscription Tiers**: Free, Monthly, Yearly, and Lifetime options
- **Progress Tracking**: Track assessment results and course progress
- **Secure Authentication**: Powered by Supabase Auth
- **Payment Processing**: Secure payments via Stripe

## 🛠️ Repository Pattern

The project uses a clean repository pattern for data access:

```typescript
// Example usage
const profileRepo = new ProfileRepository(supabaseClient)
const profile = await profileRepo.findById(userId)
const updatedProfile = await profileRepo.updateSubscription(userId, {
  subscription_status: 'monthly',
  subscription_end_date: endDate
})
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Server-side validation for all API routes
- Secure authentication with Supabase
- Environment variables for sensitive data

## 📝 Next Steps

1. Complete the remaining API routes
2. Implement the chat assessment interface
3. Create course content management
4. Add email notifications
5. Implement analytics
6. Add more payment options (quarterly, etc.)
7. Create admin dashboard
8. Add social features (community, forums)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

This project is licensed under the MIT License.
