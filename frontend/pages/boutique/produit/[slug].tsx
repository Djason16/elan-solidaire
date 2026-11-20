import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ApiSuccess, Product } from '@/utils/types'
import Seo from '@/components/ui/Seo/Seo'
import ProductView from '@/components/views/Product/ProductView'
import { useApiData } from '@/composables/useApiData'
import { builtProductSlugs } from '@/utils/content/productLinks'
import { dispatch } from '@/utils/demo/router'

/**
 * Page of a product of the starting data, built for each one (/boutique/produit/t-shirt-elan-coton-bio/). Its price
 * and stock are then read from the demo of this browser (an order lowers the stock, the admin may change the price).
 * @param props - Response of GET /products/{slug} built into the page.
 */
interface ProductPageProps {
    initial: ApiSuccess<{ product: Product }>
}

export default function ProductPage({ initial }: ProductPageProps) {
    const { data } = useApiData<{ product: Product }>(`/products/${initial.product.slug}`, initial)
    const product = data?.product ?? initial.product
    const path = `/boutique/produit/${product.slug}`

    return (
        <>
            <Seo pageKey="product" values={{
                product: product.name,
                description: product.description,
                path,
                breadcrumb: [{ name: 'Accueil', path: '/' }, { name: 'Boutique', path: '/boutique' }, { name: product.name, path }],
            }} />
            <ProductView product={product} />
        </>
    )
}

/** One page per product of the starting data, at its readable address. */
export const getStaticPaths: GetStaticPaths = async () => {
    return { paths: builtProductSlugs().map((slug) => ({ params: { slug } })), fallback: false }
}

/** The product, built into the page. */
export const getStaticProps: GetStaticProps<ProductPageProps> = async ({ params }) => {
    return { props: { initial: await dispatch<{ product: Product }>(`/products/${params?.['slug']}`) as ApiSuccess<{ product: Product }> } }
}
