import HistoryPage from "@/components/history-page"
import WalletGuard from "@/components/wallet-guard"

export default function History() {
  return (
    <WalletGuard requireConnection={true} requireCorrectNetwork={true}>
      <HistoryPage />
    </WalletGuard>
  )
}
