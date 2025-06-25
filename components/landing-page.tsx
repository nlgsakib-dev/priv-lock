"use client"
import { Lock, Shield, Eye, ArrowRight, Zap, Users } from "lucide-react"
import Link from "next/link"
import StarBorder from "@/components/ui/star-border"
import TrueFocus from "@/components/ui/true-focus"
import BlurText from "@/components/ui/blur-text"
import ClickSpark from "@/components/ui/click-spark"
import GooeyNav from "@/components/ui/gooey-nav"
import LetterGlitch from "@/components/ui/letter-glitch"

export default function LandingPage() {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Connect", href: "/connect-wallet" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-black via-deep-privacy-blue to-midnight-black relative overflow-hidden">
      {/* LetterGlitch Background - Fixed */}
      <div className="fixed inset-0 z-0 opacity-15">
        <LetterGlitch glitchSpeed={60} centerVignette={false} outerVignette={true} smooth={true} />
      </div>

      {/* Premium Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-8 backdrop-blur-xl bg-frosted-gray/5 border-b border-frosted-gray/10">
        {/* Premium Logo */}
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="relative">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-neon-cyan/20 to-deep-privacy-blue/30 backdrop-blur-md border border-neon-cyan/30 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
              <Shield className="w-8 h-8 text-neon-cyan group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 w-14 h-14 rounded-3xl border border-neon-cyan/20 animate-pulse group-hover:animate-none"></div>
          </div>
          <div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-neon-cyan bg-clip-text text-transparent group-hover:from-neon-cyan group-hover:to-white transition-all duration-500">
              Mixion Locker
            </span>
            <p className="text-xs text-frosted-gray/70 mt-1">Secure • Private • Decentralized</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden lg:block">
          <GooeyNav
            items={navItems}
            particleCount={10}
            particleDistances={[50, 6]}
            particleR={70}
            initialActiveIndex={0}
            animationTime={400}
            timeVariance={150}
            colors={[1, 2, 3, 4]}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-8 text-center">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-20 w-40 h-40 border border-neon-cyan/10 rounded-full animate-pulse"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute top-40 right-32 w-32 h-32 border border-neon-cyan/20 rounded-2xl rotate-45 animate-bounce"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute bottom-32 left-40 w-24 h-24 bg-gradient-to-r from-neon-cyan/5 to-deep-privacy-blue/5 rounded-full animate-ping"
            style={{ animationDuration: "8s" }}
          ></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Premium Hero Icon */}
          <ClickSpark sparkColor="#00D1FF" sparkSize={20} sparkRadius={30} sparkCount={16} duration={800}>
            <div className="mb-16 relative group cursor-pointer">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-neon-cyan/20 via-deep-privacy-blue/20 to-emerald-green/10 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-neon-cyan/30 hover:scale-110 transition-all duration-700 hover:shadow-[0_0_80px_rgba(0,209,255,0.4)] relative overflow-hidden">
                <Lock className="w-20 h-20 text-neon-cyan animate-pulse group-hover:animate-none transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
              </div>
              <div
                className="absolute inset-0 w-40 h-40 mx-auto rounded-full border-2 border-neon-cyan/20 animate-spin"
                style={{ animationDuration: "15s" }}
              ></div>
              <div
                className="absolute inset-0 w-40 h-40 mx-auto rounded-full border border-neon-cyan/10 animate-ping"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>
          </ClickSpark>

          {/* Hero Text */}
          <div className="space-y-8 mb-16">
            <TrueFocus
              sentence="Lock Your Wealth Share the Secret"
              manualMode={true}
              blurAmount={8}
              borderColor="#00D1FF"
              animationDuration={0.8}
              pauseBetweenAnimations={2}
            />

            <BlurText
              text="The most secure decentralized platform for locking cryptocurrencies with cryptographic privacy. Generate secrets, share securely, unlock anywhere."
              delay={80}
              animateBy="words"
              direction="top"
              className="text-xl md:text-2xl text-frosted-gray max-w-4xl mx-auto leading-relaxed"
            />
          </div>

          {/* CTA Button */}
          <div className="mb-20">
            <Link href="/connect-wallet">
              <StarBorder
                as="button"
                color="#00D1FF"
                speed="4s"
                className="transform hover:scale-110 transition-all duration-700"
              >
                <span className="flex items-center space-x-4 text-2xl font-bold px-4 py-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" />
                </span>
              </StarBorder>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Cryptographic Security",
                desc: "Military-grade encryption ensures your assets remain completely private and secure.",
                gradient: "from-blue-500/20 to-cyan-500/20",
                iconColor: "text-neon-cyan",
              },
              {
                icon: Eye,
                title: "Complete Privacy",
                desc: "No personal data required. Your identity remains anonymous throughout the process.",
                gradient: "from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-400",
              },
              {
                icon: Lock,
                title: "Decentralized Control",
                desc: "You control your funds completely. No intermediaries, no central authority.",
                gradient: "from-green-500/20 to-emerald-500/20",
                iconColor: "text-emerald-green",
              },
            ].map((feature, index) => (
              <ClickSpark
                key={index}
                sparkColor="#00D1FF"
                sparkSize={10}
                sparkRadius={25}
                sparkCount={8}
                duration={500}
              >
                <div
                  className={`group p-8 rounded-3xl backdrop-blur-md bg-gradient-to-br ${feature.gradient} border border-frosted-gray/20 hover:border-neon-cyan/50 transition-all duration-500 hover:scale-105 hover:rotate-1 cursor-pointer relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <feature.icon
                    className={`w-16 h-16 ${feature.iconColor} mb-6 mx-auto group-hover:animate-bounce group-hover:scale-110 transition-all duration-500`}
                  />
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-neon-cyan transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-frosted-gray leading-relaxed group-hover:text-white transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>
              </ClickSpark>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-neon-cyan/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-neon-cyan rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-20 backdrop-blur-md bg-frosted-gray/5 border-t border-frosted-gray/10">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, label: "Active Users", value: "10,000+" },
              { icon: Lock, label: "Funds Locked", value: "$50M+" },
              { icon: Shield, label: "Security Level", value: "Military" },
              { icon: Zap, label: "Avg Speed", value: "<2s" },
            ].map((stat, index) => (
              <div key={index} className="group">
                <stat.icon className="w-12 h-12 text-neon-cyan mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-frosted-gray">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 backdrop-blur-md bg-frosted-gray/5 border-t border-frosted-gray/10">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Shield className="w-6 h-6 text-neon-cyan" />
            <span className="text-white font-semibold">Mixion Locker</span>
            <span className="text-frosted-gray text-sm">© 2024</span>
          </div>
          <div className="flex space-x-8 text-sm text-frosted-gray">
            <Link href="/privacy" className="hover:text-neon-cyan transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neon-cyan transition-colors duration-300">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-neon-cyan transition-colors duration-300">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
