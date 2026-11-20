import { cx } from '@/utils/cx'
interface LoaderProps {
    leaving?: boolean
}

/**
 * The loading screen of the site (AppShell): the four blue bars of the original design, on the first opening and on
 * every page change. `leaving` fades it out without blocking the clicks.
 * @param props
 */
export default function Loader({ leaving = false }: LoaderProps) {
    return (
        <div className={cx('loader', leaving && 'is-leaving')} role="status" aria-live="polite">
            <span className="visually-hidden">Chargement</span>
            <div className="spinner gap-xs" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
            </div>
        </div>
    )
}
