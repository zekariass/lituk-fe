import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 no-underline"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Terms and Conditions
          </h1>
          <p className="text-muted-foreground">
            Last updated: April 16, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">

          {/* Crown Copyright */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Crown Copyright Acknowledgements</h2>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                Acknowledgement 1
              </p>
              <p className="text-sm leading-6 text-amber-800 dark:text-amber-300">
                The UK Home Office has given permission for the reproduction of Crown copyright material. The Home Office does not accept responsibility for the accuracy of the reproduction.
              </p>
            </div>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                Acknowledgement 2
              </p>
              <p className="text-sm leading-6 text-amber-800 dark:text-amber-300">
                This product includes official Life in the UK test revision materials.
              </p>
            </div>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                Acknowledgement 3
              </p>
              <p className="text-sm leading-6 text-amber-800 dark:text-amber-300">
                Contains public sector information licensed under the Open Government Licence v3.0.
              </p>
            </div>
          </section>

          {/* 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Welcome to Life In The UK Test Practice (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Life In The UK Test Practice website, mobile application, and all related services (collectively, the &ldquo;Service&rdquo;). Life In The UK Test Practice is a Life in the UK test preparation platform designed to help users study for the Life in the UK test.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Service.
            </p>
          </section>

          {/* 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              To use the Service, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li>Be at least 16 years of age</li>
              <li>Be capable of forming a binding contract under applicable law</li>
              <li>Not be barred from using the Service under the laws of your jurisdiction</li>
            </ul>
          </section>

          {/* 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Registered Accounts</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              To access certain features of the Service, you must register for an account. When registering, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              We reserve the right to suspend or terminate your account if any information provided is found to be inaccurate, misleading, or in violation of these Terms.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Guest Sessions</h3>
            <p className="text-foreground/70 leading-relaxed mb-4">
              The Service may allow you to use certain features without registering for an account through a guest session. Guest sessions are anonymous or pseudonymous and may be automatically created when you first open the application. Guest sessions may store your learning progress, preferences, and app usage locally and on our servers.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              Guest sessions do not provide the same level of account security, data recovery, or cross-device synchronisation as registered accounts. We are not responsible for any data loss associated with guest sessions. You may upgrade a guest session to a registered account at any time.
            </p>
          </section>

          {/* 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">4. Description of the Service</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              Life In The UK Test Practice provides an online Life in the UK test preparation platform that includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li><strong>Practice Questions:</strong> A comprehensive bank of Life in the UK test questions organised by category and topic</li>
              <li><strong>Mock Tests:</strong> Simulated Life in the UK tests that mirror the format and timing of the real exam</li>
              <li><strong>Traffic Signs:</strong> A reference library of traffic signs organised by category to aid visual learning</li>
              <li><strong>Flagged Questions:</strong> The ability to flag and revisit questions you find challenging</li>
              <li><strong>Progress Tracking:</strong> Tools to monitor your learning progress, scores, and areas for improvement</li>
              <li><strong>Multi-Language Support:</strong> Content available in English, Amharic, Tigrinya, Somali, and Arabic to support diverse learners</li>
              <li><strong>Leaderboards:</strong> Performance rankings to encourage competitive learning</li>
              <li><strong>Explanations:</strong> Detailed explanations for each question to support your understanding</li>
              <li><strong>Tips:</strong> Supplementary tips for questions that may include AI-generated images, videos, and text explanations to help illustrate and clarify concepts</li>
            </ul>
          </section>

          {/* 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">5. Subscriptions and Payments</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Free and Paid Features</h3>
            <p className="text-foreground/70 leading-relaxed">
              Some features of the Service are available free of charge, while others require a paid subscription. Details of available subscription plans and pricing are displayed on the Service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Payment Processing</h3>
            <p className="text-foreground/70 leading-relaxed">
              On mobile devices, all payments are processed securely through the Apple App Store or Google Play Store, depending on your device. By subscribing, you agree to the respective store&apos;s terms of service in addition to these Terms. On the Life In The UK Test Practice website, payments are processed through Stripe. We do not store your payment card details on our servers.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Billing</h3>
            <p className="text-foreground/70 leading-relaxed">
              Subscription fees are billed in accordance with the plan you select. Your subscription will automatically renew unless cancelled at least 24 hours before the end of the current period. You can manage or cancel your subscription at any time through your device&apos;s App Store or Google Play Store settings.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Refunds</h3>
            <p className="text-foreground/70 leading-relaxed">
              Refund requests for in-app purchases are handled by the Apple App Store or Google Play Store in accordance with their respective refund policies. If you need further assistance, please contact us at{' '}
              <a href="mailto:support@lifeintheuktestpractice.uk" className="text-primary hover:underline">support@lifeintheuktestpractice.uk</a>.
            </p>
          </section>

          {/* 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li>Violate any applicable law or regulation</li>
              <li>Infringe the intellectual property rights of others</li>
              <li>Distribute, reproduce, or share our content without written permission</li>
              <li>Attempt to gain unauthorised access to the Service or its systems</li>
              <li>Use automated tools (bots, scrapers, etc.) to access or interact with the Service</li>
              <li>Engage in any activity that disrupts or interferes with the Service</li>
              <li>Share your account credentials with others or allow others to use your account</li>
              <li>Submit false, misleading, or offensive content</li>
            </ul>
          </section>

          {/* 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Our Content</h3>
            <p className="text-foreground/70 leading-relaxed">
              All content on the Service, including but not limited to text, graphics, logos, icons, images, audio, software, and the overall design and layout, is the property of Life In The UK Test Practice or its licensors and is protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Crown Copyright Material</h3>
            <p className="text-foreground/70 leading-relaxed">
              Certain question content reproduced within the Service is Crown copyright material used with the permission of the UK Home Office. The UK Home Office does not accept responsibility for the accuracy of the reproduction. All Crown copyright material remains the property of the Crown.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.3 Your Use</h3>
            <p className="text-foreground/70 leading-relaxed">
              You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for personal, non-commercial purposes only. You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
            </p>
          </section>

          {/* 8 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.1 AI-Generated Content</h3>
            <p className="text-foreground/70 leading-relaxed">
              Certain contents of tips (images, videos, and text explanations) provided alongside questions are generated or assisted by artificial intelligence. While we review this content for quality and relevance, AI-generated material may occasionally contain inaccuracies or errors. AI-generated content is provided for supplementary educational purposes only and should not be treated as an authoritative or definitive source. You should always refer to official Life in the UK test materials for the most accurate and up-to-date information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.2 No Guarantee of Exam Success</h3>
            <p className="text-foreground/70 leading-relaxed">
              Life In The UK Test Practice is a study aid and preparation tool. We do not guarantee that using the Service will result in you passing the official Life in the UK test or any other examination. Your success depends on your individual effort, preparation, and performance.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Accuracy of Content</h3>
            <p className="text-foreground/70 leading-relaxed">
              While we strive to ensure that all content is accurate and up to date, we make no warranties or representations regarding the completeness, accuracy, or reliability of any content on the Service. The official Life in the UK test content and rules may change, and there may be a delay before such changes are reflected on our platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.4 &ldquo;As Is&rdquo; Basis</h3>
            <p className="text-foreground/70 leading-relaxed">
              The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          {/* 9 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              To the maximum extent permitted by applicable law, Life In The UK Test Practice and its directors, employees, partners, and affiliates shall not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Any loss of profits, data, use, goodwill, or other intangible losses</li>
              <li>Any damages resulting from your use of or inability to use the Service</li>
              <li>Any damages resulting from unauthorised access to or alteration of your data</li>
              <li>Any failure to pass the official Life in the UK test after using the Service</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              Our total liability to you for all claims arising from or related to the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the event giving rise to the claim.
            </p>
          </section>

          {/* 10 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We may suspend or terminate your access to the Service at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li>Your right to use the Service will immediately cease</li>
              <li>We may delete your account and associated data</li>
              <li>Any outstanding fees will remain payable</li>
              <li>Provisions of these Terms that by their nature should survive termination will continue to apply</li>
            </ul>
          </section>

          {/* 11 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">11. Privacy</h2>
            <p className="text-foreground/70 leading-relaxed">
              Your use of the Service is also governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information. By using the Service, you consent to the practices described in the Privacy Policy.
            </p>
          </section>

          {/* 12 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">12. Third-Party Services</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              The Service may contain links to or integrate with third-party websites and services. These include but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>RevenueCat &mdash; subscription and purchase management on mobile</li>
              <li>Google Play Billing &mdash; in-app purchases and subscriptions on Android</li>
              <li>Apple In-App Purchases &mdash; in-app purchases and subscriptions on iOS</li>
              <li>Stripe &mdash; payment processing on the website</li>
              <li>Sentry &mdash; crash reporting and diagnostics</li>
              <li>Google Sign-In &mdash; authentication on Android and iOS</li>
              <li>Apple Sign-In &mdash; authentication on iOS</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              We are not responsible for the content, privacy policies, or practices of any third-party services. Your interactions with third-party services are governed by their own terms and policies.
            </p>
          </section>

          {/* 13 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">13. Modifications to the Service and Terms</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.1 Changes to the Service</h3>
            <p className="text-foreground/70 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.2 Changes to These Terms</h3>
            <p className="text-foreground/70 leading-relaxed">
              We may revise these Terms from time to time. The most current version will always be available on this page with an updated &ldquo;Last updated&rdquo; date. By continuing to use the Service after changes take effect, you agree to be bound by the revised Terms.
            </p>
          </section>

          {/* 14 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">14. Governing Law and Dispute Resolution</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation. If the dispute cannot be resolved amicably, it shall be submitted to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          {/* 15 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">15. Indemnification</h2>
            <p className="text-foreground/70 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Life In The UK Test Practice, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your infringement of any intellectual property or other rights of any third party.
            </p>
          </section>

          {/* 16 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">16. Severability</h2>
            <p className="text-foreground/70 leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, that provision shall be enforced to the maximum extent permissible, and the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          {/* 17 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">17. Entire Agreement</h2>
            <p className="text-foreground/70 leading-relaxed">
              These Terms, together with the Privacy Policy and any other legal notices published by us on the Service, constitute the entire agreement between you and Life In The UK Test Practice regarding your use of the Service.
            </p>
          </section>

          {/* 18 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">18. Contact Us</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              If you have any questions or concerns about these Terms and Conditions, please contact us:
            </p>
            <p className="text-foreground/70 leading-relaxed">
              <strong>Email:</strong>{' '}
              <a href="mailto:support@lifeintheuktestpractice.uk" className="text-primary hover:underline">support@lifeintheuktestpractice.uk</a>
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            By using Life In The UK Test Practice, you acknowledge that you have read and understood these Terms and Conditions.
          </p>
        </div>

      </div>
    </div>
  )
}
