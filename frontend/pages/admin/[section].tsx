import type { GetStaticPaths, GetStaticProps } from 'next'
import Seo from '@/components/ui/Seo/Seo'
import AdminView from '@/components/views/Admin/AdminView'
import { ADMIN_SECTIONS } from '@/components/views/Admin/adminSections'

/**
 * A section of the administration at its French address: /admin/produits/, /admin/dons/... (private: see
 * middleware/guards.js).
 * @param props - Id of the section (code) and its address.
 */
interface AdminSectionProps {
    section: string
    slug: string
}

export default function AdminSection({ section, slug }: AdminSectionProps) {
    return (
        <>
            <Seo pageKey="admin" values={{ path: `/admin/${slug}` }} />
            <AdminView section={section} />
        </>
    )
}

/** One exported page per section (the dashboard is pages/admin/index.jsx). */
export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: ADMIN_SECTIONS.filter((item) => item.slug).map((item) => ({ params: { section: item.slug } })),
        fallback: false,
    }
}

/** The section of the page. */
export const getStaticProps: GetStaticProps<AdminSectionProps> = async ({ params }) => {
    const section = ADMIN_SECTIONS.find((item) => item.slug === params?.['section'])
    if (!section) return { notFound: true }
    return { props: { section: section.id, slug: section.slug ?? '' } }
}
