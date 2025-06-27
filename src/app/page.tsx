import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Heart, Shield, Users } from 'lucide-react'
import { APP_CONFIG } from '@/config/app.config'
import { ArchetypeChat } from '@/components/chat/ArchetypeChat'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Understand Your <span className="text-primary">Relationship Patterns</span> Through{' '}
            <span className="text-primary">Jungian Archetypes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover your masculine archetypes and shadow patterns to build healthier, more conscious relationships
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Start Your Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Start Your Journey Right Now</h2>
          <p className="text-muted-foreground">Talk to our AI assistant about your relationship patterns</p>
        </div>
        <ArchetypeChat />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why ArchMen?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Jungian Psychology</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Based on Carl Jung&apos;s proven archetypal framework for understanding the masculine psyche
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Shadow Work</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Identify and integrate your shadow patterns for authentic relationship growth
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Heart className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Relationship Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Specifically designed to improve your romantic relationships and emotional intelligence
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Expert Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered insights combined with professional psychological frameworks
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Take the Assessment</h3>
            <p className="text-muted-foreground">
              Answer questions about your relationship patterns and behaviors through our AI-guided chat
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Discover Your Archetypes</h3>
            <p className="text-muted-foreground">
              Get a detailed analysis of your dominant archetypes and shadow patterns
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Transform Your Relationships</h3>
            <p className="text-muted-foreground">
              Access personalized courses and exercises to integrate your insights
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Journey</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Get started with the basics</CardDescription>
              <div className="text-3xl font-bold mt-4">$0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {APP_CONFIG.subscriptions.free.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full mt-6" variant="outline">
                <Link href="/register">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Monthly</CardTitle>
                <Badge>Popular</Badge>
              </div>
              <CardDescription>Full access to transform your relationships</CardDescription>
              <div className="text-3xl font-bold mt-4">${APP_CONFIG.subscriptions.monthly.price}/mo</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {APP_CONFIG.subscriptions.monthly.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full mt-6">
                <Link href="/register">Start Free Trial</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Lifetime</CardTitle>
                <Badge variant="secondary">Best Value</Badge>
              </div>
              <CardDescription>One-time payment, lifetime transformation</CardDescription>
              <div className="text-3xl font-bold mt-4">${APP_CONFIG.subscriptions.lifetime.price}</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {APP_CONFIG.subscriptions.lifetime.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full mt-6" variant="outline">
                <Link href="/register">Get Lifetime Access</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Relationships?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of men who have discovered their authentic selves through archetypal understanding
        </p>
        <Button asChild size="lg">
          <Link href="/register">
            Start Your Journey Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
