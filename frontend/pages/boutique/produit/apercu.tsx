import { useRouter } from 'next/router'
import Seo from '@/components/ui/Seo/Seo'
import ProductView from '@/components/views/Product/ProductView'
import EmptyState from '@/components/views/Shop/EmptyState'
import { useApiData } from '@/composables/useApiData'
import { boxOpen } from '@/utils/icons'
import type { Product } from '@/utils/types'

/**
 * Page of a product added in the admin of the demo (/boutique/produit/apercu/?produit=gourde-bleue): it exists only
 * in this browser, so it has no built page of its own (utils/content/productLinks.js). An unknown slug shows
 * "Produit introuvable".
 */
export default function ProductPreview() {
    const { query, isReady } = useRouter()
    const slug = typeof query.produit === 'string' && /^[a-z0-9-]+$/.test(query.produit) ? query.produit : ''
    const { data, error } = useApiData<{ product: Product }>(isReady && slug ? `/products/${slug}` : null)
    const notFound = isReady && (Boolean(error) || !slug)

    return (
        <>
            <Seo pageKey="productPreview" />
            {data?.product && <ProductView product={data.product} />}
            {!data?.product && notFound && (
                <div className="product-page">
                    <EmptyState icon={boxOpen} level={1} title="Produit introuvable" text="Cet article n’est plus en vente ou son adresse est incomplète."
                        href="/boutique/" linkLabel="Voir les articles" />
                </div>
            )}
        </>
    )
}
