import LockFunds from "@/components/lock-funds"
import WalletGuard from "@/components/wallet-guard"

export default function LockFundsPage() {
  return (
    <WalletGuard requireConnection={true} requireCorrectNetwork={true}>
      <LockFunds />
    </WalletGuard>
  )
}
