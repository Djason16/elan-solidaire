import type { GetStaticProps } from 'next'
import type { ApiSuccess, ProductListData } from '@/utils/types'
import Seo from '@/components/ui/Seo/Seo'
import ShopView from '@/components/views/Shop/ShopView'
import { dispatch } from '@/utils/demo/router'

/**
 * Shop page: the catalog with its filters.
 * @param props - Catalog built into the HTML.
 */
interface ShopProps {
    initial: ApiSuccess<ProductListData>
}

export default function Shop({ initial }: ShopProps) {
    return (
        <>
            <Seo pageKey="shop" />
            <ShopView initial={initial} />
        </>
    )
}

/** The whole catalog (starting data of the demo): sorting and pages work in the browser. */
export const getStaticProps: GetStaticProps<ShopProps> = async () => {
    return { props: { initial: await dispatch<ProductListData>('/products?limit=48') as ApiSuccess<ProductListData> } }
}
