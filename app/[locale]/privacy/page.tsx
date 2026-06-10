import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
            Habesha Drive Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: March 5, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">

          {/* 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Welcome to Habesha Drive (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). This Privacy Policy explains how we collect, use, store, share, and protect information when you use the Habesha Drive mobile application, website, and related services.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              We are committed to protecting your personal information and your right to privacy. By using Habesha Drive, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">2. Scope of This Policy</h2>
            <p className="text-foreground/70 leading-relaxed">
              This Privacy Policy applies to the Habesha Drive mobile application, our public website, and related services. The web version of this policy is provided for transparency and for app store requirements, including Google Play.
            </p>
          </section>

          {/* 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">3. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Personal Information</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Register for an account, such as your name, email address, and password</li>
              <li>Contact our support team, including communication content and contact details</li>
              <li>Subscribe to our services, including subscription status and purchase-related information needed to manage your subscription</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              Subscriptions and purchase management are handled through RevenueCat and the applicable app store billing provider, such as Google Play Billing or Apple In-App Purchases, for the mobile application. On the Habesha Drive website, payments are processed through Stripe. Your payment and card information is collected and processed directly by these third-party payment providers and is never collected or stored by Habesha Drive. We only store payment event records, such as subscription status and transaction confirmations, received through payment provider webhooks.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Guest User Information</h3>
            <p className="text-foreground/70 leading-relaxed mb-4">
              When you first open the app, a guest user account may be automatically created. This allows you to use the app without registering for an account. Guest user accounts may use a unique anonymous or pseudonymous identifier connected to your selected language, jurisdiction, preferences, app progress, and history data.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Guest user account tokens or identifiers may be stored securely on your device. Guest users are available only in the Habesha Drive mobile app. There are no guest users on the Habesha Drive website.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Usage, Activity, and Diagnostic Information</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We may collect limited usage, activity, and diagnostic information necessary to operate, secure, debug, and improve the app. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Practice activity, selected answers, test attempts, completed questions, scores, study history, and learning progress</li>
              <li>App interactions, such as screens used, features accessed, and interactions with app content, where collected</li>
              <li>Device model, operating system version, app version, and device or app identifiers</li>
              <li>Guest user identifiers, account identifiers, RevenueCat identifiers, and identifiers used for subscription management, diagnostics, security, and account management</li>
              <li>Crash logs, error logs, diagnostics, crash traces, and related technical information</li>
              <li>Interactions with AI-generated tips content, if applicable</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Location and Jurisdiction Information</h3>
            <p className="text-foreground/70 leading-relaxed">
              We collect your selected country and jurisdiction information to provide you with relevant driving theory test content specific to your region. This is selected by you during initial setup and stored locally on your device.
            </p>
          </section>

          {/* 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">4. Crash Reports and Diagnostics</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              We may collect crash reports and diagnostic information to identify and fix technical issues. This may include device type, operating system version, app version, error logs, crash traces, and the time the error occurred.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              We use Sentry to help collect and analyze crash reports and diagnostics.
            </p>
          </section>

          {/* 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">5. How We Use Your Information</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li><strong>Service Delivery:</strong> To provide, maintain, and improve our driving theory test preparation services</li>
              <li><strong>Account Management:</strong> To create and manage your registered account or guest user account</li>
              <li><strong>Personalization:</strong> To customise your learning experience, track your progress, and show relevant app content</li>
              <li><strong>Payment and Subscription Management:</strong> To manage subscriptions, purchase status, billing events, and premium access through RevenueCat and the applicable app store billing provider</li>
              <li><strong>Communication:</strong> To send service updates and respond to support messages</li>
              <li><strong>Diagnostics:</strong> To identify and fix technical issues, crashes, and bugs</li>
              <li><strong>Security:</strong> To detect, prevent, and address technical issues, misuse, and fraudulent activity</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          {/* 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Service Providers</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We use trusted third-party service providers to operate, maintain, and improve Habesha Drive. These providers may process information on our behalf according to their own privacy policies and contractual obligations.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-3">
              Third-party service providers we use include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li>RevenueCat &mdash; subscription and purchase management</li>
              <li>Google Play Billing &mdash; in-app purchases and subscriptions on Android</li>
              <li>Apple In-App Purchases &mdash; in-app purchases and subscriptions on iOS</li>
              <li>Stripe &mdash; payment processing on the website</li>
              <li>Sentry &mdash; crash reporting and diagnostics</li>
              <li>Google Sign-In &mdash; authentication on Android and iOS</li>
              <li>Apple Sign-In &mdash; authentication on iOS</li>
            </ul>
          </section>

          {/* 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">7. Information Sharing and Disclosure</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li><strong>Service Providers:</strong> With third-party service providers only as necessary to operate, maintain, and improve the app, website, and related services</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, limited information may be shared as part of the transfer</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property, and that of our users</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed mt-4">
              Information shared with service providers may be used for app functionality, account management, subscription management, crash reporting, diagnostics, security, fraud prevention, compliance, and service improvement.
            </p>
          </section>

          {/* 8 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Encryption of data in transit using HTTPS</li>
              <li>Secure on-device token storage using platform-native encrypted storage, such as Keychain on iOS and Keystore on Android</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure payment processing through trusted providers</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          {/* 9 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">9. Account and Data Deletion</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Registered users can delete their Habesha Drive account themselves from the Profile screen in the mobile app or from the Profile page on the website.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Guest users do not have a registered account. Guest users are available only in the Habesha Drive mobile app. There are no guest users on the Habesha Drive website. Guest users can reset their history data in the mobile app. When a guest user resets their history data, the existing guest history data is cleared and a new empty guest user account is created automatically.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-4">
              If you encounter an error, or if you do not have access to the mobile app or website to delete your account, please contact us at{' '}
              <a href="mailto:support@habeshadrive.com" className="text-primary hover:underline">support@habeshadrive.com</a>.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-4">
              We will delete or anonymize personal information within 30 days of a valid deletion request, unless we are required to retain certain information for legal, security, fraud prevention, accounting, tax, subscription, app store transaction, or dispute-resolution purposes.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              <strong>Account Deletion Instructions:</strong>{' '}
              <a href="https://www.habeshadrive.com/account-deletion" className="text-primary hover:underline">https://www.habeshadrive.com/account-deletion</a>
            </p>
          </section>

          {/* 10 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Data Retention</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li>Registered account data is retained while your account is active</li>
              <li>Subscription and purchase records are retained as needed for billing, app store, legal, tax, accounting, fraud prevention, subscription management, or dispute-resolution purposes</li>
              <li>Crash reports and diagnostics are retained only as long as needed for debugging, service improvement, security, and diagnostics</li>
              <li>Guest user account history data may remain on the device until you reset it, clear app data, or uninstall the app</li>
              <li>Support communications may be retained as needed to respond to your request and maintain support records</li>
            </ul>
          </section>

          {/* 11 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">11. Your Privacy Rights</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to our processing of your personal information</li>
              <li><strong>Restriction:</strong> Request restriction of processing your personal information</li>
              <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time where we rely on consent</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:support@habeshadrive.com" className="text-primary hover:underline">support@habeshadrive.com</a>. We will respond to your request within 30 days.
            </p>
          </section>

          {/* 12 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">12. Legal Bases for EEA and UK Users</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              For users in the European Economic Area and the United Kingdom, we process personal information based on one or more legal bases, including performance of a contract, legitimate interests, legal obligations, and consent where required.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li><strong>Performance of a contract:</strong> To provide the app, website, accounts, subscriptions, premium access, and support</li>
              <li><strong>Legitimate interests:</strong> To secure the service, fix bugs, prevent fraud, improve app reliability, manage subscriptions, and understand essential app usage</li>
              <li><strong>Legal obligations:</strong> To comply with tax, accounting, legal, and regulatory requirements</li>
              <li><strong>Consent:</strong> For optional notifications, marketing, or other processing where required</li>
            </ul>
          </section>

          {/* 13 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">13. Local Storage and Device Data</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              Our mobile application stores certain data locally on your device to support app functionality and improve your experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Authentication tokens stored in encrypted device storage, such as Keychain on iOS and Keystore on Android</li>
              <li>User preferences such as theme, language selection, and jurisdiction</li>
              <li>Cached content to support limited offline functionality</li>
              <li>In-progress test state to allow session recovery</li>
              <li>Guest user account data, history data, and reset state</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              You can clear locally stored data by using available reset options in the app, clearing the app data through your device settings, or uninstalling the application.
            </p>
          </section>

          {/* 14 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">14. International Data Transfers</h2>
            <p className="text-foreground/70 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence where Habesha Drive or its service providers operate. These countries may have different data protection laws. We use appropriate safeguards where required to protect your personal information in accordance with this Privacy Policy.
            </p>
          </section>

          {/* 15 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">15. Children&apos;s Privacy</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Habesha Drive is not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. Our services are intended for users who are old enough to prepare for driving theory tests in their jurisdiction. If you are a parent or guardian and believe that a child has provided us with personal information, please contact us and we will take steps to delete the information.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              If Habesha Drive is ever made available to children or families, we will update this Privacy Policy and our data practices to comply with applicable children&apos;s privacy laws and Google Play Families Policy requirements.
            </p>
          </section>

          {/* 16 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">16. Data Safety and App Store Disclosures</h2>
            <p className="text-foreground/70 leading-relaxed">
              Our Google Play Data Safety section and other app store privacy disclosures are intended to summarize our mobile app data practices. This Privacy Policy provides additional detail. We aim to keep these disclosures accurate and consistent with this Privacy Policy.
            </p>
          </section>

          {/* 17 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">17. Changes to This Privacy Policy</h2>
            <p className="text-foreground/70 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by posting the new Privacy Policy within the application and updating the &ldquo;Last updated&rdquo; date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* 18 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">18. Specific Regional Rights</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.1 European Economic Area (EEA) Users</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              If you are located in the EEA, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with your local data protection authority.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.2 California Residents</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your information, and the right to opt out of the sale of your personal information. We do not sell personal information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">18.3 Other Jurisdictions</h3>
            <p className="text-foreground/70 leading-relaxed">
              We comply with applicable data protection laws in all jurisdictions where we operate. If you have specific questions about your rights in your jurisdiction, please contact us.
            </p>
          </section>

          {/* 19 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">19. Contact Us</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <p className="text-foreground/70 leading-relaxed mb-2">
              <strong>Support:</strong>{' '}
              <a href="mailto:support@habeshadrive.com" className="text-primary hover:underline">support@habeshadrive.com</a>
            </p>
            <p className="text-foreground/70 leading-relaxed mb-2">
              <strong>Public Privacy Policy URL:</strong>{' '}
              <a href="https://www.habeshadrive.com/privacy" className="text-primary hover:underline">https://www.habeshadrive.com/privacy</a>
            </p>
            <p className="text-foreground/70 leading-relaxed">
              <strong>Account Deletion Instructions:</strong>{' '}
              <a href="https://www.habeshadrive.com/account-deletion" className="text-primary hover:underline">https://www.habeshadrive.com/account-deletion</a>
            </p>
          </section>

          {/* 20 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">20. Related Policies</h2>
            <p className="text-foreground/70 leading-relaxed">
              For more information about how we operate, please review our Terms and Conditions, accessible from the Info screen within the application.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            By using Habesha Drive, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  )
}
