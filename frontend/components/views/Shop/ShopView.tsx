import type { ApiSuccess, Product, ProductListData } from '@/utils/types'
import { useRef, useState } from 'react'
import FormField from '@/components/ui/FormField/FormField'
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro'
import { useApiData } from '@/composables/useApiData'
import { useReveal } from '@/composables/useReveal'
import { useCartStore } from '@/stores/cart'
import { boxOpen } from '@/utils/icons'
import EmptyState from './EmptyState'
import ProductCard from './ProductCard'
import ShopPagination from './ShopPagination'
import { availableStock } from './stock'
import { cx } from '@/utils/cx'

// Products per page, as in the original shop
const PER_PAGE = 10

// Sorts of the original shop ("Disponibles seulement" filters instead of sorting)
type SortKey = 'default' | 'popularity' | 'recent' | 'price-asc' | 'price-desc' | 'in-stock'

const SORTS: Record<SortKey, (products: Product[]) => Product[]> = {
    default: (products) => [...products].sort((a, b) => a.id - b.id),
    popularity: (products) => [...products].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)),
    recent: (products) => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    'price-asc': (products) => [...products].sort((a, b) => a.price - b.price),
    'price-desc': (products) => [...products].sort((a, b) => b.price - a.price),
    'in-stock': (products) => products.filter((product) => product.stock > 0),
}

const SORT_OPTIONS: { value: SortKey, label: string }[] = [
    { value: 'default', label: 'Ordre conseillé' },
    { value: 'popularity', label: 'Les plus aimés' },
    { value: 'recent', label: 'Nouveautés d’abord' },
    { value: 'price-asc', label: 'Tarifs croissants' },
    { value: 'price-desc', label: 'Tarifs décroissants' },
    { value: 'in-stock', label: 'En stock uniquement' },
]

/**
 * The shop, as in the original design: title, "Affichage de 1–10 sur N résultats" with the sort list, grid of
 * product cards appearing one after the other, and the pagination. The whole catalog comes built into the page,
 * then from the demo of this browser (stock lowered by orders, products changed in the admin); sorting and pages
 * work on the spot.
 * @param props - Response of GET /products?limit=48 built into the page.
 */
export default function ShopView({ initial }: { initial: ApiSuccess<ProductListData> }) {
    const { data } = useApiData<ProductListData>('/products?limit=48', initial)
    const cartItems = useCartStore((state) => state.items)
    const [sort, setSort] = useState<SortKey>('default')
    const [page, setPage] = useState(1)
    const [ref, visible] = useReveal<HTMLDivElement>(0.05)
    const top = useRef<HTMLElement | null>(null)
    const products = (data ?? initial).products

    if (!products.length) {
        return (
            <section className="shop-page">
                <EmptyState icon={boxOpen} level={1} title="Boutique en pause" text="Aucun article en vente pour le moment. Repassez dans quelques jours !"
                    href="/" linkLabel="Revenir à l’accueil" />
            </section>
        )
    }

    const sorted = SORTS[sort](products)
    const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
    const current = Math.min(page, pages)
    const shown = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE)
    const first = sorted.length ? (current - 1) * PER_PAGE + 1 : 0
    const last = Math.min(current * PER_PAGE, sorted.length)

    const changePage = (next: number) => {
        setPage(next)
        top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <section className="shop-page" ref={top}>
            <SectionIntro title="Boutique" level={1}>
                <p>Chaque achat <mark>soutient directement nos programmes</mark>.</p>
            </SectionIntro>

            <div ref={ref} className={cx('shop-results-section', visible && 'is-visible')}>
                <div className="shop-results-header gap-m">
                    <p className="text-normal" role="status">
                        Affichage de <mark>{first}–{last}</mark> sur <mark>{sorted.length} résultat{sorted.length > 1 ? 's' : ''}</mark>
                    </p>
                    <FormField label="Trier les produits" hideLabel name="sort" type="select" value={sort} options={SORT_OPTIONS}
                        className="shop-sort text-small" onChange={(_, value) => { setSort(value as SortKey); setPage(1) }} />
                </div>

                {/* key: a new page or sort plays the appear animation of the cards again */}
                <ul key={`${sort}-${current}`} className="shop-grid">
                    {shown.map((product, index) => (
                        <li key={product.id}>
                            <ProductCard product={product} available={availableStock(product, cartItems)} index={index} />
                        </li>
                    ))}
                </ul>

                <ShopPagination page={current} pages={pages} onChange={changePage} />
            </div>
        </section>
    )
}
