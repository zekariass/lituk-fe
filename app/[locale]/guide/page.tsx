import { readFile } from 'fs/promises'
import { join } from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MarkdownContent } from '@/components/guide/markdown-content'
import { TocSidebar } from '@/components/guide/toc-sidebar'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractHeadings(content: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = []
  const regex = /^## (.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim()
    headings.push({ id: slugify(text), text })
  }
  return headings
}

function preprocessContent(content: string): string {
  // Convert "Key things to remember" sections into blockquotes
  // so they render as styled callout boxes
  return content.replace(
    /### Key things to remember\n\n((?:- .+\n)+)\n/g,
    '> ### Key things to remember\n>\n> $1\n'
  )
}

export default async function GuidePage() {
  let content: string
  try {
    const filePath = join(process.cwd(), 'docs', 'guide.md')
    content = await readFile(filePath, 'utf-8')
  } catch {
    notFound()
  }

  const rawHeadings = extractHeadings(content)
  const processedContent = preprocessContent(content)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 no-underline"
        >
          <ArrowLeft size={16} />
          Back to Practice
        </Link>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="hidden lg:block flex-shrink-0 w-56">
            <TocSidebar items={rawHeadings} />
          </aside>
          <main className="flex-1 min-w-0">
            <MarkdownContent content={processedContent} />
          </main>
        </div>
      </div>
    </div>
  )
}
