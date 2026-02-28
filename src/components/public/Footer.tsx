import Link from 'next/link'

interface NavItem {
  id: string
  label: string
  url: string
  children?: NavItem[]
}

interface FooterProps {
  siteName: string
  footerText?: string | null
  socialLinks?: { instagram?: string; tiktok?: string; linkedin?: string; twitter?: string } | null
  navItems: NavItem[]
}

export function PublicFooter({ siteName, footerText, socialLinks, navItems }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-white font-heading text-lg font-bold mb-3">{siteName}</h3>
            {footerText && (
              <p className="text-sm text-gray-400 leading-relaxed">{footerText}</p>
            )}
            {socialLinks && (
              <div className="flex gap-4 mt-4">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Instagram
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                    TikTok
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Nav columns */}
          {navItems.map((section) => (
            <div key={section.id}>
              <h4 className="text-white text-sm font-semibold mb-3">{section.label}</h4>
              <ul className="space-y-2">
                {section.children?.map((item) => (
                  <li key={item.id}>
                    <Link href={item.url} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/transparency" className="text-xs text-gray-500 hover:text-gray-300">
              Transparency Centre
            </Link>
            <Link href="/faq" className="text-xs text-gray-500 hover:text-gray-300">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
