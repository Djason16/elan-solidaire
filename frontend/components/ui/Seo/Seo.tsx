import Head from 'next/head'
import { useSite } from '@/composables/useSite'
import { buildSeo, type SeoPageKey, type SeoValues } from '@/utils/seo'

/**
 * Head tags of a page of SEO_PAGES (utils/seo.js), written in the exported HTML.
 *   <Seo pageKey="shop" />
 *   <Seo pageKey="product" values={{ product: product.name, description: product.description, path: `/boutique/produit/${product.slug}`, image: product.image }} />
 * @param props - `values` fills the {{placeholders}} and may override path and image.
 */
export default function Seo({ pageKey, values }: { pageKey: SeoPageKey, values?: SeoValues }) {
    const seo = buildSeo({ pageKey, locale: 'fr', site: useSite(), values })

    return (
        <Head>
            <title>{seo.title}</title>
            {seo.meta.map((tag) => (
                <meta key={'name' in tag ? tag.name : tag.property} {...tag} />
            ))}
            {seo.link.map((link) => (
                <link key={link.rel} {...link} />
            ))}
            {seo.jsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd).replaceAll('<', '\\u003c') }} />
            )}
        </Head>
    )
}
