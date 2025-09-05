import Link from 'next/link'
import { ArrowLeft, Brain, Heart, Shield, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">About ArchMen</h1>
            <p className="text-slate-600 mt-1">Discover your archetypal patterns and unlock your potential</p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Mission Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Our Mission</h2>
            <p className="text-slate-700 leading-relaxed text-lg mb-6">
              ArchMen is dedicated to helping individuals understand their deepest psychological patterns through the lens of Jungian archetypes. We believe that by recognizing and integrating our archetypal energies, we can live more authentic, fulfilling lives.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Our AI-powered platform combines ancient wisdom with modern technology to provide personalized insights into your personality, shadow patterns, and growth opportunities.
            </p>
          </section>

          {/* Features Grid */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI-Powered Assessments
                  </CardTitle>
                  <CardDescription>
                    Advanced conversational AI that adapts to your responses, providing deeper insights than traditional questionnaires.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Shadow Work Guidance
                  </CardTitle>
                  <CardDescription>
                    Identify and integrate your shadow patterns with personalized recommendations and exercises.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Archetype Analysis
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis of your dominant archetypes including King, Warrior, Magician, Lover, and more.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Personal Development
                  </CardTitle>
                  <CardDescription>
                    Structured courses and content designed to help you work through specific archetypal challenges.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* The Science Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">The Science Behind ArchMen</h2>
            <div className="bg-slate-100 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Jungian Psychology</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our approach is grounded in the work of Carl Jung, who identified universal patterns of behavior and personality that he called archetypes. These archetypal energies influence how we think, feel, and act in the world.
              </p>
              <p className="text-slate-700 leading-relaxed">
                By understanding your archetypal makeup, you can better understand your motivations, relationships, and life patterns.
              </p>
            </div>

            <div className="bg-slate-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Modern AI Integration</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use advanced natural language processing to analyze your responses and identify linguistic patterns that reveal your archetypal preferences. Our AI is trained on thousands of archetypal profiles and psychological assessments.
              </p>
              <p className="text-slate-700 leading-relaxed">
                This allows us to provide more nuanced and personalized insights than traditional multiple-choice assessments.
              </p>
            </div>
          </section>

          {/* Privacy & Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Privacy & Security</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We take your privacy seriously. All assessment data is encrypted and stored securely. We never share your personal information or assessment results with third parties without your explicit consent.
            </p>
            <p className="text-slate-700 leading-relaxed">
              You maintain full control over your data and can delete your account and all associated information at any time.
            </p>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Ready to discover your archetypal patterns? Start with our free assessment to get a taste of what ArchMen can offer. For deeper insights and personalized recommendations, consider upgrading to one of our premium plans.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg">
                  Start Free Assessment
                </Button>
              </Link>
              <Link href="/#pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Have questions about ArchMen or need support? We&apos;re here to help.
            </p>
            <div className="space-y-2 text-slate-700">
              <p><strong>Email:</strong> support@archmen.com</p>
              <p><strong>Support Hours:</strong> Monday - Friday, 9 AM - 5 PM PST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
