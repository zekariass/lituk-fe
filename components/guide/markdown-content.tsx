'use client'

import { type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Lightbulb } from 'lucide-react'

function textFromNode(node: ReactNode): string {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textFromNode).join('')
  const el = node as unknown as { props?: { children?: ReactNode } }
  if (el.props?.children != null) {
    return textFromNode(el.props.children)
  }
  return ''
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
            {children}
          </h1>
        ),
        h2: ({ children }) => {
          const id = slugify(textFromNode(children))
          return (
            <h2
              id={id}
              className="text-2xl font-bold mt-16 mb-5 pb-3 border-b-2 border-border scroll-mt-24"
            >
              {children}
            </h2>
          )
        },
        h3: ({ children }) => (
          <h3 className="text-lg font-bold mt-10 mb-3 text-foreground scroll-mt-24">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-foreground/80 leading-[1.75] mb-5">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 space-y-2.5 text-foreground/80 mb-5 marker:text-muted-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 space-y-2.5 text-foreground/80 mb-5 marker:text-muted-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-[1.75] pl-1">{children}</li>,
        blockquote: ({ children }) => {
          const allText = textFromNode(children)
          const isKeyThings = allText.includes('Key things to remember')

          let renderedChildren = children
          if (isKeyThings && Array.isArray(children)) {
            renderedChildren = children.filter((child) => {
              const childText = textFromNode(child)
              return !childText.includes('Key things to remember')
            })
          }

          return (
            <blockquote
              className={`relative rounded-lg border-l-4 pl-5 pr-4 py-4 mb-6 not-italic ${
                isKeyThings
                  ? 'bg-sky-500/[0.06] border-sky-500/60'
                  : 'bg-muted/40 border-primary/40'
              }`}
            >
              {isKeyThings && (
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} className="text-sky-500 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Key things to remember
                  </span>
                </div>
              )}
              <div className="text-foreground/80 leading-[1.75]">
                {renderedChildren}
              </div>
            </blockquote>
          )
        },
        hr: () => <hr className="my-10 border-border" />,
        strong: ({ children }) => (
          <strong className="font-bold text-foreground">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-foreground/70">
            {children}
          </em>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-6 rounded-lg border border-border">
            <table className="w-full text-sm border-collapse">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/60 border-b border-border">{children}</thead>
        ),
        tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
        tr: ({ children }) => (
          <tr className="even:bg-muted/20 hover:bg-muted/30 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="text-left px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-foreground/80 align-top">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
