import Seo from '@/components/ui/Seo/Seo'
import AdminView from '@/components/views/Admin/AdminView'

/**
 * Dashboard of the administration (private: see middleware/guards.js). Its exported HTML has no data: everything
 * is loaded after the role is checked.
 */
export default function AdminHome() {
    return (
        <>
            <Seo pageKey="admin" />
            <AdminView section="overview" />
        </>
    )
}
