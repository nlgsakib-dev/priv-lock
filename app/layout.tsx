import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import PageTransition from "@/components/page-transition"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mixion Locker - Privacy-Focused Decentralized Transactions",
  description:
    "Lock your wealth, share the secret. The most secure decentralized platform for cryptocurrency transactions with cryptographic privacy.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-midnight-black">
      <body className={`${inter.className} bg-midnight-black`}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
