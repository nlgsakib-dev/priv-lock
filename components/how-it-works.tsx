"use client"

import { useState } from "react"
import { Lock, Key, Shield, ArrowRight, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import SophisticatedCipherBackground from "@/components/sophisticated-cipher-background"
import MicroInteraction from "@/components/micro-interactions"

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const router = useRouter()

  const steps = [
    {
      icon: Lock,
      title: "Lock Your Funds",
      description:
        "Connect your wallet and select the cryptocurrency you want to lock. Choose the amount and confirm the transaction.",
      details: [
        "Connect MetaMask or compatible wallet",
        "Select supported cryptocurrency (ETH, USDC, DAI)",
        "Enter amount to lock",
        "Approve transaction if using ERC-20 tokens",
        "Confirm locking transaction",
      ],
    },
    {
      icon: Key,
      title: "Receive Secret Hash",
      description:
        "Once your funds are locked, you'll receive a unique cryptographic hash that serves as the key to unlock your funds.",
      details: [
        "Unique 64-character hexadecimal hash generated",
        "Hash is cryptographically secure and random",
        "Copy and store your secret hash safely",
        "Hash cannot be recovered if lost",
        "No personal information linked to hash",
      ],
    },
    {
      icon: Shield,
      title: "Share Securely",
      description:
        "Share your secret hash with anyone you want to give access to the locked funds. They can unlock and withdraw to their wallet.",
      details: [
        "Share hash through secure channels",
        "Recipient doesn't need to know your identity",
        "Hash works from any wallet address",
        "One-time use for security",
        "Instant verification and withdrawal",
      ],
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
            <span className="text-xl font-bold text-white">How It Works</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Simple, Secure,
            <br />
            <span className="text-neon-cyan drop-shadow-[0_0_20px_rgba(0,209,255,0.5)]">Anonymous</span>
          </h1>
          <p className="text-xl text-frosted-gray max-w-3xl mx-auto leading-relaxed">
            Mixion Locker makes cryptocurrency privacy simple with just three steps. Lock your funds, get a secret,
            share securely.
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="mb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <MicroInteraction key={index} trigger="hover" type="glow" intensity="low" className="rounded-2xl">
                <div
                  className={`p-8 rounded-2xl backdrop-blur-md border transition-all duration-500 cursor-pointer ${
                    activeStep === index
                      ? "bg-neon-cyan/10 border-neon-cyan/50 scale-105"
                      : "bg-frosted-gray/10 border-frosted-gray/20 hover:border-neon-cyan/30"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        activeStep === index ? "bg-neon-cyan/20" : "bg-frosted-gray/20"
                      }`}
                    >
                      <step.icon
                        className={`w-8 h-8 ${activeStep === index ? "text-neon-cyan" : "text-frosted-gray"}`}
                      />
                    </div>
                    <div
                      className={`text-2xl font-bold ${activeStep === index ? "text-neon-cyan" : "text-frosted-gray"}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-frosted-gray leading-relaxed">{step.description}</p>

                  {activeStep === index && (
                    <div className="mt-6 space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-green flex-shrink-0" />
                          <span className="text-sm text-frosted-gray">{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </MicroInteraction>
            ))}
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">The Complete Flow</h2>
          <div className="backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-deep-privacy-blue/50 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-neon-cyan" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Lock Funds</h3>
                <p className="text-sm text-frosted-gray">Secure your crypto</p>
              </div>

              <ArrowRight className="w-8 h-8 text-neon-cyan hidden md:block" />
              <div className="md:hidden w-full h-px bg-neon-cyan/30"></div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-golden-yellow/50 flex items-center justify-center">
                  <Key className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Get Secret</h3>
                <p className="text-sm text-frosted-gray">Receive unique hash</p>
              </div>

              <ArrowRight className="w-8 h-8 text-neon-cyan hidden md:block" />
              <div className="md:hidden w-full h-px bg-neon-cyan/30"></div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-green/50 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Share & Unlock</h3>
                <p className="text-sm text-frosted-gray">Anonymous access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Zero Knowledge", desc: "No personal data stored" },
              { title: "Cryptographic", desc: "Military-grade encryption" },
              { title: "Decentralized", desc: "No central authority" },
              { title: "Open Source", desc: "Transparent and auditable" },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl backdrop-blur-md bg-frosted-gray/10 border border-frosted-gray/20"
              >
                <h3 className="text-lg font-semibold text-neon-cyan mb-2">{feature.title}</h3>
                <p className="text-sm text-frosted-gray">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
