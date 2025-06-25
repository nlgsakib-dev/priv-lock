import UnlockFunds from "@/components/unlock-funds"
import WalletGuard from "@/components/wallet-guard"

export default function UnlockFundsPage() {
  return (
    <WalletGuard requireConnection={true} requireCorrectNetwork={true}>
      <UnlockFunds />
    </WalletGuard>
  )
}
