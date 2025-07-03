# Environment Setup Guide

## Required Environment Variables

### Supabase Configuration (Required)

These are already configured in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key ✅

Missing but required for admin operations:
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin API operations)

### OpenAI Configuration (Required for Chat)

- `OPENAI_API_KEY` - Your OpenAI API key for the AI chat functionality

### Application Configuration (Recommended)

- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://archmen.vercel.app)

## Setting Up Environment Variables

### Local Development

1. Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Production

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the missing variables:
   - `OPENAI_API_KEY` (encrypted, for all environments)
   - `SUPABASE_SERVICE_ROLE_KEY` (encrypted, for all environments)
   - `NEXT_PUBLIC_APP_URL` (plain text, for all environments)

## Database Schema

The application expects these tables in Supabase:

1. `profiles` - User profiles
2. `assessments` - Assessment data
3. `archetype_results` - Assessment results
4. `conversations` - Chat conversations
5. `courses` - Course content
6. `course_enrollments` - User enrollments

## Admin Console Features

The admin console at `/admin` provides:

1. **Assessments Tab**: Create and manage assessment workflows
2. **Archetype Content Tab**: Manage 52+ Jungian archetypes
3. **Archetype Linguistics Tab**: Configure language patterns for detection
4. **AI Assistant Tab**: Tools for content generation

## Current Status

✅ Basic structure working
✅ Admin page accessible at `/admin`
⚠️ Missing OpenAI API key (chat won't work)
⚠️ Missing Supabase service role key (admin operations limited)
✅ Repository pattern implemented
✅ Serverless functions ready

## Next Steps

1. Add the missing environment variables in Vercel
2. Set up database tables if not already created
3. Test the chat functionality with OpenAI key
4. Implement authentication for admin access 