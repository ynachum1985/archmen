'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Heart, Shield, Users, Target, Send } from 'lucide-react'
import { APP_CONFIG } from '@/config/app.config'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

export default function HomePage() {
  const [message, setMessage] = useState('')

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Hero Content */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                    Understand Your{' '}
                    <span className="text-gradient">Relationship Patterns</span>
                  </h1>
                  <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                    Break free from toxic cycles. Discover your shadow through Carl Jung&apos;s archetypes.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft-lg font-medium">
                    Take Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/5 hover:border-accent/50 font-medium">
                    Learn More
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary font-display">12</div>
                    <div className="text-sm text-muted-foreground font-body">Archetypes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent font-display">5min</div>
                    <div className="text-sm text-muted-foreground font-body">Assessment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary font-display">Instant</div>
                    <div className="text-sm text-muted-foreground font-body">Results</div>
                  </div>
                </div>
              </div>

              {/* Chat Widget */}
              <div className="lg:pt-0">
                <Card className="shadow-soft-lg border border-border/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="flex flex-col h-[600px] bg-gradient-to-br from-white to-muted/20">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-soft">
                          <span className="text-white text-sm font-medium">AI</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="rounded-lg p-4 max-w-[85%] shadow-soft bg-gradient-to-r from-muted/30 to-muted/50 text-foreground border border-border/50 backdrop-blur-sm">
                            <p className="font-body whitespace-pre-wrap">
                              I&apos;m here to help you understand your relationship patterns through Jungian archetypes. What brings you here today?
                            </p>
                          </div>
                          <div className="font-body text-xs text-muted-foreground">
                            07:16 AM
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t bg-gradient-to-r from-muted/10 to-muted/20 backdrop-blur-sm">
                      <div className="flex gap-3">
                        <Textarea
                          className="flex-1 min-h-[3rem] max-h-[8rem] resize-none bg-white/80 backdrop-blur-sm border-border/50 focus:border-primary rounded-lg shadow-sm font-body"
                          placeholder="Share what&apos;s on your mind..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button 
                          size="icon"
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-lg shadow-soft hover:shadow-soft-lg transition-all duration-200"
                          disabled={!message.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transform Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Transform Your <span className="text-gradient">Relationships</span>
              </h2>
              <p className="font-body text-lg text-muted-foreground">
                Discover the patterns that shape your connections
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center shadow-soft border-border/50 bg-white">
                <Target className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">Identify Patterns</h3>
                <p className="font-body text-sm text-muted-foreground">
                  Recognize recurring relationship dynamics and behaviors
                </p>
              </Card>

              <Card className="p-6 text-center shadow-soft border-border/50 bg-white">
                <Brain className="h-8 w-8 text-accent mx-auto mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">Shadow Work</h3>
                <p className="font-body text-sm text-muted-foreground">
                  Explore unconscious aspects affecting your relationships
                </p>
              </Card>

              <Card className="p-6 text-center shadow-soft border-border/50 bg-white">
                <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">Heal & Grow</h3>
                <p className="font-body text-sm text-muted-foreground">
                  Build healthier, more fulfilling connections
                </p>
              </Card>
            </div>
          </div>
        </div>
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
