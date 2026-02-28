"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Vote,
  MapPin,
  Flag,
  Users,
  ClipboardList,
  FileCheck,
  FileText,
  Newspaper,
  HelpCircle,
  Quote,
  Navigation,
  Palette,
  ShieldCheck,
  Menu,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Elections", href: "/admin/elections", icon: Vote },
  { label: "Electorates", href: "/admin/electorates", icon: MapPin },
  { label: "Parties", href: "/admin/parties", icon: Flag },
  { label: "Candidates", href: "/admin/candidates", icon: Users },
  { label: "Policies & Questions", href: "/admin/policies", icon: ClipboardList },
  { label: "Assessments", href: "/admin/assessments", icon: FileCheck },
  { label: "Content Pages", href: "/admin/content", icon: FileText },
  { label: "Articles", href: "/admin/content/articles", icon: Newspaper },
  { label: "FAQs", href: "/admin/content/faqs", icon: HelpCircle },
  { label: "Testimonials", href: "/admin/content/testimonials", icon: Quote },
  { label: "Navigation Items", href: "/admin/content/navigation", icon: Navigation },
  { label: "Branding & Settings", href: "/admin/branding", icon: Palette },
  { label: "Admin Users", href: "/admin/users", icon: ShieldCheck },
]

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href) && item.href !== "/admin"
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A"

  return (
    <>
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5" />
                Ballot Builder
              </SheetTitle>
            </SheetHeader>
            <div className="py-4" onClick={() => setSheetOpen(false)}>
              <SidebarNav />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          <h1 className="text-lg font-semibold">Ballot Builder</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/admin/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-4 overflow-y-auto border-r bg-background">
          {/* Logo */}
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <Vote className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Ballot Builder</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2">
            <SidebarNav />
          </div>

          {/* User info */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/admin/login" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  )
}
