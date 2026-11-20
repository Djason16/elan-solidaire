import Seo from '@/components/ui/Seo/Seo'
import CartView from '@/components/views/Cart/CartView'

/**
 * Cart and checkout page.
 */
export default function Cart() {
    return (
        <>
            <Seo pageKey="cart" />
            <CartView />
        </>
    )
}
