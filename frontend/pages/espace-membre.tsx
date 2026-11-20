import Seo from '@/components/ui/Seo/Seo'
import AccountView from '@/components/views/Account/AccountView'

/**
 * Member space (private page: see middleware/guards.js). Its exported HTML has no personal content.
 */
export default function Account() {
    return (
        <>
            <Seo pageKey="account" />
            <AccountView />
        </>
    )
}
