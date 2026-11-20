import BaseButton from '@/components/ui/BaseButton/BaseButton'

/**
 * Page numbers to show: the first, the last, and the current one with its neighbours; "…" fills the gaps.
 * @param current
 * @param pages
 * @returns e.g. [1, '…', 4, 5, 6, '…', 9]
 */
const pageItems = (current: number, pages: number): (number | string)[] => {
    const wanted = [...new Set([1, current - 1, current, current + 1, pages])].filter((page) => page >= 1 && page <= pages).sort((a, b) => a - b)
    return wanted.flatMap((page, index) => (index > 0 && page - (wanted[index - 1] ?? 0) > 1 ? [`gap-${page}`, page] : [page]))
}

/**
 * Pagination of the shop, as in the original design: "Précédent" on the left, squared page numbers in the middle
 * (blue = current page), "Suivant" on the right.
 * @param props
 * @param props.page - Current page (from 1).
 * @param props.pages - Number of pages.
 * @param props.onChange
 */
export default function ShopPagination({ page, pages, onChange }: { page: number, pages: number, onChange: (page: number) => void }) {
    return (
        <nav className="shop-pagination" aria-label="Pages de la boutique">
            <div className="pagination-left">
                {page > 1 && <BaseButton variant="secondary" squared className="nav-btn" onClick={() => onChange(page - 1)}>Précédent</BaseButton>}
            </div>
            <div className="pagination-center gap-xs">
                {pageItems(page, pages).map((item) => (typeof item === 'string'
                    ? <span key={item} className="ellipsis text-semibold" aria-hidden="true">...</span>
                    : (
                        <BaseButton key={item} squared variant={item === page ? 'primary' : 'secondary'} className="page-number-btn"
                            aria-current={item === page ? 'page' : undefined} aria-label={`Page ${item}`} onClick={() => onChange(item)}>
                            {item}
                        </BaseButton>
                    )))}
            </div>
            <div className="pagination-right">
                {page < pages && <BaseButton variant="secondary" squared className="nav-btn" onClick={() => onChange(page + 1)}>Suivant</BaseButton>}
            </div>
        </nav>
    )
}
