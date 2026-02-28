import type { Metadata } from "next"
import { Libre_Baskerville, Libre_Franklin } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
})

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Build a Ballot",
  description:
    "Research candidates, compare policies, and build your personalised ballot before election day.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${libreBaskerville.variable} ${libreFranklin.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
