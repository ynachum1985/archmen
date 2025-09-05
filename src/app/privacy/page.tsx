import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-slate-600 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We collect information you provide directly to us, such as when you create an account, take assessments, or contact us for support.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Assessment Data</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Your responses to assessment questions</li>
              <li>Archetype analysis results</li>
              <li>Progress tracking data</li>
              <li>Course completion information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Provide and improve our services</li>
              <li>Generate personalized assessments and recommendations</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send you important updates about your account</li>
              <li>Provide customer support</li>
              <li>Analyze usage patterns to improve our platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except as described below:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
              <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, user information may be transferred</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure payment processing through Stripe</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Export your assessment data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request information about how your data is used</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze how you use our platform</li>
              <li>Provide personalized content</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and data at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes via email or through our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us at privacy@archmen.com.
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
