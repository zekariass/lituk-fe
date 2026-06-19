'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
}

interface TocSidebarProps {
  items: TocItem[]
}

export function TocSidebar({ items }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.intersectionRatio - b.intersectionRatio)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="hidden md:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Contents
      </h4>
      <ul className="space-y-1 border-l border-border pl-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`block text-sm leading-snug transition-colors ${
                activeId === item.id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
