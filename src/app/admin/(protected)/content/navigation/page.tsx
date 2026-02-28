import { prisma } from "@/lib/db"
import { NavigationClient } from "./navigation-client"

export default async function NavigationPage() {
  const navItems = await prisma.navItem.findMany({
    include: { parent: true, children: true },
    orderBy: { sortOrder: "asc" },
  })
  return <NavigationClient navItems={JSON.parse(JSON.stringify(navItems))} />
}
