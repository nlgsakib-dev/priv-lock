import Dashboard from "@/components/dashboard"
import WalletGuard from "@/components/wallet-guard"

export default function DashboardPage() {
  return (
    <WalletGuard requireConnection={true} requireCorrectNetwork={true}>
      <Dashboard />
    </WalletGuard>
  )
}
