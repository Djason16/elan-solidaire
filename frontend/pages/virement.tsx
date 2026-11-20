import Seo from '@/components/ui/Seo/Seo'
import BankTransferView from '@/components/views/Support/BankTransferView'

/**
 * Bank details to finish a donation by transfer (fictional bank account).
 */
export default function BankTransfer() {
    return (
        <>
            <Seo pageKey="bankTransfer" />
            <BankTransferView />
        </>
    )
}
