import { prisma } from '@/lib/db'
import { PublicHeader } from '@/components/public/Header'
import { PublicFooter } from '@/components/public/Footer'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })
  const headerNav = await prisma.navItem.findMany({
    where: { location: 'header', parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: { children: { orderBy: { sortOrder: 'asc' } } },
  })
  const footerNav = await prisma.navItem.findMany({
    where: { location: 'footer', parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: { children: { orderBy: { sortOrder: 'asc' } } },
  })

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        '--match-green': settings?.matchGreenColor || '#22c55e',
        '--match-orange': settings?.matchOrangeColor || '#f97316',
        '--match-red': settings?.matchRedColor || '#ef4444',
        '--match-grey': settings?.matchGreyColor || '#9ca3af',
      } as React.CSSProperties}
    >
      <PublicHeader
        siteName={settings?.siteName || 'Build a Ballot'}
        logo={settings?.logo}
        navItems={headerNav}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter
        siteName={settings?.siteName || 'Build a Ballot'}
        footerText={settings?.footerText}
        socialLinks={settings?.socialLinks ? JSON.parse(settings.socialLinks) : null}
        navItems={footerNav}
      />
    </div>
  )
}
