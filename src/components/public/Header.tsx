'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  url: string
  children?: NavItem[]
}

interface HeaderProps {
  siteName: string
  logo?: string | null
  navItems: NavItem[]
}

export function PublicHeader({ siteName, logo, navItems }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-heading font-bold text-primary">{siteName}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  href={item.url}
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 pt-2 hidden group-hover:block">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/questionnaire"
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Build Your Ballot
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.url}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={child.url}
                      className="block pl-6 py-1.5 text-sm text-gray-500 hover:text-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link
                href="/questionnaire"
                className="mt-2 mx-3 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium text-center hover:opacity-90"
                onClick={() => setMobileOpen(false)}
              >
                Build Your Ballot
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
