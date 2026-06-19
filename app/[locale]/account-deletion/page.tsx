import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AccountDeletionPage() {
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
            Life In The UK Test Practice Account Deletion
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">

          {/* Registered Users */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Registered users can delete their Life In The UK Test Practice account themselves from the Profile screen in the mobile app or from the Profile page on the website.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-3">
              To delete your registered account:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-foreground/70">
              <li>Open the Life In The UK Test Practice mobile app or website.</li>
              <li>Go to the Profile screen or Profile page.</li>
              <li>Select the account deletion option.</li>
              <li>Confirm that you want to delete your account.</li>
            </ol>
          </section>

          {/* Guest Users */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Guest Users</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Guest users are available only in the Life In The UK Test Practice mobile app. There are no guest users on the Life In The UK Test Practice website.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              Guest users can reset their history data in the mobile app. When a guest user resets their history data, the existing guest history data is cleared and a new empty guest account is created automatically.
            </p>
          </section>

          {/* Need Help */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              If you encounter an error, or if you do not have access to the mobile app or website to delete your account, please contact us at:
            </p>
            <p className="text-foreground/70 leading-relaxed mb-2">
              <a href="mailto:support@lifeintheuktestpractice.uk" className="text-primary hover:underline">support@lifeintheuktestpractice.com</a>
            </p>
            <p className="text-foreground/70 leading-relaxed">
              You can also reach us using our{' '}
              <Link href="/contact" className="text-primary underline">Contact Us</Link> form.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
