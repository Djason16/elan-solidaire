import { association, developer } from './content/site'
import { joinUrl, withTrailingSlash } from './pathHelpers'

/**
 * SEO of every page: title, description, share image, Open Graph and JSON-LD for search engines and social networks.
 * Adding a page: add an entry below (its path, its share image of public/, its title and description).
 * {{name}} in a title or a description is the name of the site.
 *   keywords: optional    noIndex: true = hidden from search engines (admin, login...)
 * @module utils/seo
 */
export interface SeoPage {
    path: string
    image?: string
    noIndex?: boolean
    keywords?: string
    title: string
    description: string
}

/** Values that fill the {{placeholders}} of a page, and may override its path and image. */
export interface SeoValues {
    path?: string
    image?: string
    breadcrumb?: { name: string, path: string }[]
    [placeholder: string]: unknown
}

export interface SeoSite {
    name: string
    url: string
}

export type MetaTag = { name: string, content: string } | { property: string, content: string }

export const SEO_PAGES = {
    index: { path: '/', image: '/images/og-image.jpg', title: 'Accueil | {{name}}', description: 'Accès à l’eau, éducation, nutrition, santé et reboisement : découvrez les actions d’Élan Solidaire, association humanitaire fictive, et soutenez-les.' },
    support: { path: '/don', title: 'Nous soutenir : don et adhésion | {{name}}', description: 'Faites un don à un projet ou devenez membre d’Élan Solidaire. Paiement par carte, PayPal ou virement (simulés sur cette démo).' },
    membership: { path: '/adhesion', title: 'Devenir membre | {{name}}', description: 'Adhérez à Élan Solidaire pour un an : carte de membre, journal de l’association et vote à l’assemblée générale (paiement simulé sur cette démo).' },
    bankTransfer: { path: '/virement', noIndex: true, title: 'Don par virement | {{name}}', description: 'Coordonnées bancaires pour finaliser un don par virement.' },
    shop: { path: '/boutique', title: 'Boutique solidaire | {{name}}', description: 'Vêtements, accessoires et objets fabriqués par des ateliers partenaires : chaque achat finance les programmes de l’association.' },
    product: { path: '/boutique/produit', title: '{{product}} | Boutique {{name}}', description: '{{description}}' },
    productPreview: { path: '/boutique/produit/apercu', noIndex: true, title: 'Aperçu d’un produit | {{name}}', description: 'Produit ajouté dans l’administration de la démo.' },
    cart: { path: '/panier', noIndex: true, title: 'Panier | {{name}}', description: 'Votre panier et le paiement de la commande.' },
    events: { path: '/evenements', title: 'Agenda des événements | {{name}}', description: 'Marches solidaires, ateliers et rencontres d’Élan Solidaire : inscrivez-vous en ligne (démonstration).' },
    event: { path: '/evenements', title: '{{event}} | Agenda {{name}}', description: '{{description}}' },
    eventPreview: { path: '/evenements/apercu', noIndex: true, title: 'Aperçu d’un événement | {{name}}', description: 'Événement ajouté dans l’administration de cette démonstration.' },
    features: { path: '/fonctionnalites', title: 'Ce que comprend ce site | {{name}}', description: 'Dons, adhésions, boutique, agenda, espace membre, administration : toutes les fonctions de cette démo de site associatif.' },
    tracking: { path: '/suivi', noIndex: true, title: 'Suivi de colis | {{name}}', description: 'Suivi simulé d’un colis de la boutique solidaire (démonstration).' },
    contact: { path: '/contact', title: 'Contact | {{name}}', description: 'Une question, une idée de partenariat, l’envie de devenir bénévole ? Écrivez à Élan Solidaire.' },
    login: { path: '/connexion', noIndex: true, title: 'Connexion | {{name}}', description: 'Connexion à l’espace membre et à l’administration.' },
    forgotPassword: { path: '/mot-de-passe-oublie', noIndex: true, title: 'Mot de passe oublié | {{name}}', description: 'Recevez un lien pour choisir un nouveau mot de passe (valable une heure, à usage unique).' },
    account: { path: '/espace-membre', noIndex: true, title: 'Mon espace | {{name}}', description: 'Votre adhésion, vos dons et vos commandes.' },
    admin: { path: '/admin', noIndex: true, title: 'Administration | {{name}}', description: 'Administration de l’association.' },
    legalNotice: { path: '/mentions-legales', title: 'Mentions légales | {{name}}', description: 'Éditeur, hébergeur et crédits du site de démonstration Élan Solidaire.' },
    privacyPolicy: { path: '/confidentialite', title: 'Politique de confidentialité | {{name}}', description: 'Ce que deviennent les données saisies sur la démonstration Élan Solidaire.' },
    termsOfSale: { path: '/cgv', title: 'Conditions générales de vente | {{name}}', description: 'Conditions de la boutique solidaire de démonstration.' },
    cookiePolicy: { path: '/cookies', title: 'Politique de cookies | {{name}}', description: 'Cookies et stockage utilisés par la démonstration Élan Solidaire.' },
    notFound: { path: '/404', noIndex: true, title: 'Page introuvable | {{name}}', description: 'Cette page n’existe pas.' },
}

const LOCALES: Record<string, string> = { fr: 'fr_FR', en: 'en_US' }

/**
 * Builds the head tags of a page.
 * @param options
 * @param options.pageKey - Key of SEO_PAGES.
 * @param options.locale - 'fr'.
 * @param options.site - Name and address of the site.
 * @param [options.values] - Values of the {{placeholders}} and overrides: { product, description, path, image },
 *   and `breadcrumb` ([{ name, path }]) for the structured data.
 */
export type SeoPageKey = keyof typeof SEO_PAGES

export const buildSeo = ({ pageKey, locale, site, values = {} }: { pageKey: SeoPageKey, locale: string, site: SeoSite, values?: SeoValues }) => {
    const base: SeoPage = SEO_PAGES[pageKey]
    const page: SeoPage = { ...base, ...(values.path ? { path: values.path } : {}), ...(values.image ? { image: values.image } : {}) }
    const fill = (text: string) => Object.entries({ name: site.name, ...values })
        .reduce((result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)), text)
    const title = fill(page.title)
    const description = fill(page.description)
    const url = withTrailingSlash(joinUrl(site.url, page.path ?? '/'))
    const image = joinUrl(site.url, page.image ?? SEO_PAGES.index.image)
    const robots = page.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'

    const meta: MetaTag[] = [
        { name: 'description', content: description },
        { name: 'robots', content: robots },
        ...(page.keywords ? [{ name: 'keywords', content: page.keywords }] : []),
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: site.name },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image },
        { property: 'og:locale', content: LOCALES[locale] ?? locale },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${site.name} : une main tendue pour un vrai élan` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        // Tells tools like Wappalyzer that the site was made with DC Scaffold; remove this line to hide it
        { name: 'generator', content: 'DC Scaffold' },
        { name: 'author', content: developer.name },
    ]

    return {
        title,
        description,
        url,
        meta,
        link: [{ rel: 'canonical', href: url }],
        jsonLd: page.noIndex ? null : structuredData({ site, title, description, url, image, locale, breadcrumb: values.breadcrumb }),
    }
}

// The developer of the demo: creator, author, publisher and copyright holder of the site. The association is fictive:
// it stays the subject of the pages (`about`)
const developerJsonLd = {
    '@type': 'Person',
    '@id': `${developer.href}/#person`,
    name: developer.name,
    url: developer.href,
    jobTitle: 'Développeur web',
    sameAs: developer.profiles,
}
const developerRef = { '@id': developerJsonLd['@id'] }
const authorship = { creator: developerRef, author: developerRef, publisher: developerRef, copyrightHolder: developerRef }

/**
 * JSON-LD of a page for search engines: the association (NGO), the website, the page itself and, when given, its
 * breadcrumb. One @graph, the nodes linked by their @id.
 * @param options - Site, page settings, texts, address, image, locale and breadcrumb ([{ name, path }]).
 */
const structuredData = ({ site, title, description, url, image, locale, breadcrumb }: {
    site: SeoSite
    title: string
    description: string
    url: string
    image: string
    locale: string
    breadcrumb?: { name: string, path: string }[]
}) => {
    const home = withTrailingSlash(site.url)
    const graph: Record<string, unknown>[] = [
        {
            '@type': ['NGO', 'Organization'],
            '@id': `${home}#organization`,
            name: site.name,
            url: home,
            logo: joinUrl(site.url, '/icon-512.png'),
            description: 'Association humanitaire fictive, créée pour un site de démonstration.',
            email: association.email,
            address: { '@type': 'PostalAddress', streetAddress: '12 rue des Tilleuls', postalCode: '69000', addressLocality: 'Lyon', addressCountry: 'FR' },
        },
        { '@type': 'WebSite', '@id': `${home}#website`, name: site.name, url: home, inLanguage: locale, ...authorship },
        {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            name: title,
            description,
            url,
            inLanguage: locale,
            primaryImageOfPage: image,
            isPartOf: { '@id': `${home}#website` },
            about: { '@id': `${home}#organization` },
            ...authorship,
        },
        developerJsonLd,
    ]
    if (breadcrumb?.length) {
        graph.push({
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumb.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: withTrailingSlash(joinUrl(site.url, item.path)),
            })),
        })
    }
    return { '@context': 'https://schema.org', '@graph': graph }
}
