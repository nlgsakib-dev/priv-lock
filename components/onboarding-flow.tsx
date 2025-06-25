"use client"

import { useState } from "react"
import Stepper, { Step } from "@/components/ui/stepper"
import { Wallet, Shield, Key, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import BlurText from "@/components/ui/blur-text"

export default function OnboardingFlow() {
  const [walletAddress, setWalletAddress] = useState("")
  const [secretPhrase, setSecretPhrase] = useState("")

  const handleStepChange = (step: number) => {
    console.log(`Current step: ${step}`)
  }

  const handleComplete = () => {
    console.log("Onboarding completed!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Stepper
          initialStep={1}
          onStepChange={handleStepChange}
          onFinalStepCompleted={handleComplete}
          backButtonText="Previous"
          nextButtonText="Next"
          stepCircleContainerClassName="border-neon-cyan/30"
        >
          <Step>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-neon-cyan/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-neon-cyan" />
              </div>
              <BlurText
                text="Welcome to Mixion Locker"
                className="text-3xl font-bold text-white"
                delay={100}
                animateBy="words"
              />
              <p className="text-frosted-gray">
                The most secure way to lock and share cryptocurrency with cryptographic privacy.
              </p>
            </div>
          </Step>

          <Step>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-emerald-green/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-green" />
              </div>
              <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
              <p className="text-frosted-gray mb-4">
                Connect your MetaMask wallet to get started with secure transactions.
              </p>
              <Input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x1a2b3c4d..."
                className="bg-midnight-black/50 border-frosted-gray/30 text-white"
              />
            </div>
          </Step>

          <Step>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-golden-yellow/20 rounded-full flex items-center justify-center">
                <Key className="w-8 h-8 text-golden-yellow" />
              </div>
              <h2 className="text-2xl font-bold text-white">Secure Your Account</h2>
              <p className="text-frosted-gray mb-4">
                Create a backup phrase to secure your account and recover access if needed.
              </p>
              <Input
                type="password"
                value={secretPhrase}
                onChange={(e) => setSecretPhrase(e.target.value)}
                placeholder="Enter your secret phrase..."
                className="bg-midnight-black/50 border-frosted-gray/30 text-white"
              />
            </div>
          </Step>

          <Step>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-emerald-green/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-green" />
              </div>
              <h2 className="text-2xl font-bold text-white">You're All Set!</h2>
              <p className="text-frosted-gray">
                Your account is now secure and ready to use. Start locking your funds with complete privacy.
              </p>
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  )
}
