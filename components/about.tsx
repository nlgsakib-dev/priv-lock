"use client"

import { Shield, Lock, Eye, Users, Zap, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import SophisticatedCipherBackground from "@/components/sophisticated-cipher-background"
import MicroInteraction from "@/components/micro-interactions"

export default function About() {
  const router = useRouter()

  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "Advanced cryptographic protocols ensure your assets remain completely secure and private.",
    },
    {
      icon: Eye,
      title: "Complete Privacy",
      description: "Zero personal data collection. Your identity and transactions remain completely anonymous.",
    },
    {
      icon: Lock,
      title: "Decentralized Control",
      description: "You maintain full control of your funds. No intermediaries, no central authority.",
    },
    {
      icon: Users,
      title: "Trustless System",
      description: "Smart contracts eliminate the need for trust. Code is law, transparency is guaranteed.",
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Lightning-fast locking and unlocking with minimal gas fees on the blockchain.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access your locked funds from anywhere in the world, anytime, with just your secret.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black relative overflow-hidden">
      <SophisticatedCipherBackground />

      {/* Header */}
      <header className="backdrop-blur-md bg-frosted-gray/10 border-b border-frosted-gray/20 p-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => router.push("/")}
            className="text-frosted-gray hover:text-neon-cyan transition-colors duration-300"
          >
            ← Back to Home
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-neon-cyan" />
            <span className="text-xl font-bold text-white">About Mixion Locker</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The Future of
            <br />
            <span className="text-neon-cyan drop-shadow-[0_0_20px_rgba(0,209,255,0.5)]">Private Finance</span>
          </h1>
          <p className="text-xl text-frosted-gray max-w-3xl mx-auto leading-relaxed">
            Mixion Locker revolutionizes cryptocurrency security through advanced cryptographic protocols, enabling
            truly private and decentralized asset management without compromising on security or accessibility.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-16">
          <div className="backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-frosted-gray text-center leading-relaxed">
              To democratize financial privacy and security by providing a decentralized platform where individuals can
              lock their cryptocurrency assets with complete anonymity, generating cryptographic secrets that enable
              secure, trustless transactions without revealing personal identity or transaction history.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why Choose Mixion Locker</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <MicroInteraction key={index} trigger="hover" type="glow" intensity="low" className="rounded-2xl">
                <div className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 hover:border-neon-cyan/50 transition-all duration-300 hover:scale-105">
                  <feature.icon className="w-12 h-12 text-neon-cyan mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-frosted-gray leading-relaxed">{feature.description}</p>
                </div>
              </MicroInteraction>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <div className="backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Advanced Technology Stack</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-neon-cyan mb-4">Cryptographic Security</h3>
                <ul className="space-y-2 text-frosted-gray">
                  <li>• SHA-256 hash generation</li>
                  <li>• AES-256 encryption protocols</li>
                  <li>• RSA-2048 key management</li>
                  <li>• ECDSA signature verification</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neon-cyan mb-4">Blockchain Integration</h3>
                <ul className="space-y-2 text-frosted-gray">
                  <li>• Ethereum smart contracts</li>
                  <li>• ERC-20 token support</li>
                  <li>• Gas optimization</li>
                  <li>• Multi-signature security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Built by Privacy Advocates</h2>
          <p className="text-lg text-frosted-gray max-w-3xl mx-auto leading-relaxed">
            Our team consists of cryptography experts, blockchain developers, and privacy advocates who believe that
            financial privacy is a fundamental right. We're committed to building tools that empower individuals to
            maintain control over their digital assets.
          </p>
        </div>
      </div>
    </div>
  )
}
