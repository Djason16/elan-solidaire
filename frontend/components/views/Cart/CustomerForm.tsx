import type { FormApi } from '@/composables/useForm'
import type { CartFormValues } from './CartView'
import AppLink from '@/components/ui/AppLink/AppLink'
import FormField from '@/components/ui/FormField/FormField'
import Icon from '@/components/ui/Icon/Icon'
import PaymentChoice from '@/components/views/Support/PaymentChoice'
import { countries, formatEuros } from '@/utils/format'
import { truck } from '@/utils/icons'

// Fields of the form, two by two as in the original: [name, label, type, placeholder, autocomplete]
const ROWS: [keyof CartFormValues, string, string, string, string][][] = [
    [['lastName', 'Nom *', 'text', 'Votre nom', 'family-name'], ['firstName', 'Prénom *', 'text', 'Votre prénom', 'given-name']],
    [['email', 'Email *', 'email', 'votre@email.fr', 'email'], ['phone', 'Téléphone *', 'tel', '+33 6 00 00 00 00', 'tel']],
    [['address', 'Adresse complète *', 'text', 'Numéro et nom de rue', 'street-address']],
    [['postalCode', 'Code postal *', 'text', '69003', 'postal-code'], ['city', 'Ville *', 'text', 'Lyon', 'address-level2']],
]

// Delivery time of each zone (the carrier block of the original)
const deliveryTime = (country: string) => (country === 'FR' ? '2 à 4 jours ouvrés' : ['BE', 'LU', 'DE', 'ES', 'IT'].includes(country) ? '4 à 7 jours ouvrés' : '6 à 10 jours ouvrés')

/**
 * Delivery details of the checkout, as in the original design: name, contact, address, country, carrier (once the
 * country is chosen), payment method and acceptance of the terms of sale.
 * @param props
 * @param props.form - Return of useForm (values, errors, setField).
 * @param props.shipping - Shipping cost for the chosen country, null before.
 * @param [props.locked=false] - true while a payment is running.
 */
interface CustomerFormProps {
    form: FormApi<CartFormValues>
    shipping: number | null
    locked?: boolean
}

export default function CustomerForm({ form, shipping, locked = false }: CustomerFormProps) {
    const { values, errors, setField } = form

    return (
        <div className="card customer-form">
            <h2 className="cart-form-title text-semibold text-normal">Adresse de livraison</h2>
            <p className="checkout-intro text-normal">
                <mark>Plus qu’une étape</mark> avant de valider.<br />
                Indiquez où nous devons envoyer votre colis.
            </p>

            {ROWS.map((row) => (
                <div key={row[0]?.[0]} className="cart-form-row">
                    {row.map(([name, label, type, placeholder, autoComplete]) => (
                        <FormField key={name} label={label} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete}
                            value={values[name]} error={errors[name]} onChange={setField} disabled={locked} />
                    ))}
                </div>
            ))}

            <FormField label="Pays *" name="country" type="select" placeholder="Sélectionner un pays" value={values.country}
                error={errors.country} onChange={setField} disabled={locked} autoComplete="country"
                options={Object.entries(countries).map(([value, label]) => ({ value, label }))} />

            {shipping !== null && (
                <div className="form-group">
                    <h3 className="cart-form-title text-semibold text-normal">Mode de livraison</h3>
                    <p className="action-button text-semibold primary squared carrier-button gap-xs">
                        <Icon icon={truck} className="text-large" />
                        <span className="carrier-name text-semibold">Livraison à domicile (simulée)</span>
                        <span className="carrier-price">{shipping === 0 ? 'Offerte' : formatEuros(shipping)}</span>
                        <span className="carrier-delivery text-small">{deliveryTime(values.country)}</span>
                    </p>
                </div>
            )}

            <PaymentChoice value={values.paymentMethod} error={errors.paymentMethod} onChange={setField} disabled={locked} />

            <FormField type="checkbox" name="acceptTerms" value={values.acceptTerms} error={errors.acceptTerms} onChange={setField} disabled={locked}
                label={(
                    <span className="text-normal">
                        J’accepte les{' '}
                        <AppLink href="/cgv/" className="cgv-link text-semibold" title="Lire les conditions générales de vente">Conditions Générales de Vente</AppLink> *
                    </span>
                )} />
            <p className="form-note text-small">* Information à fournir pour envoyer la commande (Code de la consommation)</p>
        </div>
    )
}
