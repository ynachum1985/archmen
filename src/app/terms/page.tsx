import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-slate-600 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              By accessing and using ArchMen (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              ArchMen is an AI-powered platform that provides archetypal personality assessments, shadow work guidance, and personal development courses. The service includes:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>AI-powered personality assessments</li>
              <li>Archetype analysis and insights</li>
              <li>Shadow work recommendations</li>
              <li>Personal development courses</li>
              <li>Progress tracking and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              To access certain features of the Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Some features of the Service require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Pay all applicable fees as described on the Service</li>
              <li>Automatic renewal unless cancelled</li>
              <li>Our refund policy as stated in your subscription terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You may not use the Service to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for commercial purposes without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at support@archmen.com.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/register">
            <Button>
              Back to Registration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
