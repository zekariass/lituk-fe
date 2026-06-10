import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: March 5, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              This Cookie Policy explains how HabeshaDrive (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and similar technologies to recognise you when you visit our driving theory test preparation platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              By using HabeshaDrive, you consent to the use of cookies and similar technologies as described in this policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">2. What Are Cookies?</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until deleted or expired).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">3. Technologies We Use</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              HabeshaDrive uses the following storage technologies and mechanisms:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Local Storage</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We use browser Local Storage to store data locally on your device. This technology is similar to cookies but can store larger amounts of data.
            </p>
            
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">Authentication Tokens</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Store your access and refresh tokens to keep you logged in</li>
                <li><strong>Data Stored:</strong> JWT access token, JWT refresh token</li>
                <li><strong>Duration:</strong> Until you log out or tokens expire</li>
                <li><strong>Essential:</strong> Yes - Required for authentication</li>
              </ul>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">User State (Zustand Persist)</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Persist your application state across sessions</li>
                <li><strong>Data Stored:</strong> User profile, selected license category, authentication status, content language preferences</li>
                <li><strong>Duration:</strong> Persistent until cleared</li>
                <li><strong>Essential:</strong> Yes - Required for app functionality</li>
              </ul>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">Test Progress Data</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Save your progress in mock tests and revision sessions</li>
                <li><strong>Data Stored:</strong> Current question index, selected answers, test session data, timer state</li>
                <li><strong>Duration:</strong> Until test completion or manual clearing</li>
                <li><strong>Essential:</strong> Yes - Required to resume tests</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Theme Preferences (next-themes)</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We use the next-themes library to manage your dark/light mode preference.
            </p>
            
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">Theme Cookie</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Remember your theme preference (dark, light, or system)</li>
                <li><strong>Data Stored:</strong> Theme selection (&ldquo;dark&rdquo;, &ldquo;light&rdquo;, or &ldquo;system&rdquo;)</li>
                <li><strong>Duration:</strong> 1 year</li>
                <li><strong>Essential:</strong> No - Functional/Preference cookie</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Internationalization (next-intl)</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We use next-intl to provide content in multiple languages (English, Amharic, Tigrinya, Somali, and Arabic).
            </p>
            
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">Locale Preference</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Remember your language preference</li>
                <li><strong>Data Stored:</strong> Selected locale code (&ldquo;en&rdquo;, &ldquo;am&rdquo;, &ldquo;ti&rdquo;, &ldquo;so&rdquo;, or &ldquo;ar&rdquo;)</li>
                <li><strong>Duration:</strong> Session or persistent based on implementation</li>
                <li><strong>Essential:</strong> Yes - Required for proper content display</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Progressive Web App (PWA)</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              Our platform is a Progressive Web App that can be installed on your device.
            </p>
            
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">Service Worker & Cache Storage</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Enable offline functionality and faster loading</li>
                <li><strong>Data Stored:</strong> Cached pages, assets, and API responses</li>
                <li><strong>Duration:</strong> Until cache is cleared or updated</li>
                <li><strong>Essential:</strong> No - Performance enhancement</li>
              </ul>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">PWA Install Prompt State</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Remember if you've dismissed the install prompt</li>
                <li><strong>Data Stored:</strong> Install prompt interaction state</li>
                <li><strong>Duration:</strong> Session-based</li>
                <li><strong>Essential:</strong> No - User experience enhancement</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.5 Payment Processing (Stripe)</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              When you make a payment, Stripe (our payment processor) may set cookies for fraud prevention and payment processing.
            </p>
            
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-foreground mb-3">Stripe Cookies</h4>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                <li><strong>Purpose:</strong> Fraud detection and secure payment processing</li>
                <li><strong>Data Stored:</strong> Payment session data, fraud prevention tokens</li>
                <li><strong>Duration:</strong> Varies by cookie type</li>
                <li><strong>Essential:</strong> Yes - Required for payment processing</li>
                <li><strong>Third Party:</strong> Stripe (see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a>)</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">4. Cookie Categories</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              We categorize our cookies and similar technologies as follows:
            </p>

            <div className="space-y-4">
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Strictly Necessary</h3>
                <p className="text-foreground/70 leading-relaxed mb-2">
                  These are essential for the website to function properly. They enable core functionality such as security, authentication, and accessibility.
                </p>
                <p className="text-sm text-foreground/60">
                  Examples: Authentication tokens, session management, locale preferences
                </p>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Functional</h3>
                <p className="text-foreground/70 leading-relaxed mb-2">
                  These enhance functionality and personalization, such as remembering your preferences and settings.
                </p>
                <p className="text-sm text-foreground/60">
                  Examples: Theme preference, language selection, test progress
                </p>
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Performance</h3>
                <p className="text-foreground/70 leading-relaxed mb-2">
                  These help us understand how visitors interact with our platform by collecting and reporting information anonymously.
                </p>
                <p className="text-sm text-foreground/60">
                  Examples: PWA cache, service worker storage
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">5. Why We Use These Technologies</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              We use cookies and similar storage technologies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li><strong>Authentication:</strong> To keep you logged in and verify your identity</li>
              <li><strong>Security:</strong> To protect your account and prevent unauthorized access</li>
              <li><strong>Functionality:</strong> To remember your preferences and settings</li>
              <li><strong>Performance:</strong> To improve loading times and enable offline access</li>
              <li><strong>User Experience:</strong> To provide a personalized learning experience</li>
              <li><strong>Progress Tracking:</strong> To save your test progress and learning history</li>
              <li><strong>Payment Processing:</strong> To securely process subscription payments</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Cookies</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              We use limited third-party services that may set their own cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li><strong>Stripe:</strong> For payment processing and fraud prevention</li>
            </ul>
            <p className="text-foreground/70 leading-relaxed">
              These third parties have their own privacy policies and cookie policies. We recommend reviewing them:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mt-3">
              <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a></li>
              <li><a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Cookie Policy</a></li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">7. How to Control Cookies</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              You have the right to decide whether to accept or reject cookies. Here are your options:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Browser Settings</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Browser-Specific Instructions</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.3 Local Storage</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              To clear Local Storage data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Open your browser's Developer Tools (usually F12)</li>
              <li>Go to the Application or Storage tab</li>
              <li>Select Local Storage and clear the data for habeshadrive.com</li>
              <li>Alternatively, use your browser's "Clear browsing data" feature</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.4 Impact of Disabling Cookies</h3>
            <p className="text-foreground/70 leading-relaxed mb-3">
              Please note that if you disable or refuse cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li>You will not be able to log in or use authenticated features</li>
              <li>Your preferences and settings will not be saved</li>
              <li>Test progress will not be saved between sessions</li>
              <li>Some features of the platform may not function properly</li>
              <li>You may need to manually adjust settings each visit</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="text-foreground/70 leading-relaxed">
              The data stored in cookies and local storage is retained as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mt-3">
              <li><strong>Session data:</strong> Cleared when you close your browser</li>
              <li><strong>Authentication tokens:</strong> Valid until expiration or logout</li>
              <li><strong>Persistent preferences:</strong> Stored until manually cleared or account deletion</li>
              <li><strong>Test progress:</strong> Stored until test completion or manual clearing</li>
              <li><strong>PWA cache:</strong> Updated periodically or cleared manually</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">9. Updates to This Policy</h2>
            <p className="text-foreground/70 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-muted/30 border border-border rounded-lg p-6">
              <p className="text-foreground/70 mb-2"><strong>Email:</strong> privacy@habeshadrive.com</p>
              <p className="text-foreground/70"><strong>Support:</strong> support@habeshadrive.com</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">11. Related Policies</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              For more information about how we handle your data, please review:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70">
              <li><Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-primary hover:underline">Terms and Conditions</Link></li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            By continuing to use HabeshaDrive, you consent to our use of cookies and similar technologies as described in this policy.
          </p>
        </div>

      </div>
    </div>
  )
}
