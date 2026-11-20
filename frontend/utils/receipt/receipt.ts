import type { PdfBox, PdfLine, Rgb } from './pdf'
import type { PublicDonation } from '@/utils/types'
import { association } from '@/utils/content/site'
import { TAX_REDUCTION_RATE, projectTitle } from '@/utils/content/programs'
import { formatDate, formatEuros } from '@/utils/format'

/**
 * Fictional tax receipt of a donation, as a PDF made in the browser (utils/receipt/pdf.js, loaded only now).
 * It shows the 66 % tax reduction and says clearly that it is a fictional document of the demonstration.
 * @param donation
 * @returns The file is downloaded ("recu-fiscal-DON-1051.pdf").
 */
export type ReceiptDonation = Pick<PublicDonation, 'amount' | 'frequency' | 'reference' | 'createdAt' | 'fullName' | 'email' | 'project'>

export async function downloadReceipt(donation: ReceiptDonation): Promise<void> {
    const { buildPdf } = await import('./pdf')
    const reduction = Math.round(donation.amount * TAX_REDUCTION_RATE * 100) / 100
    const monthly = donation.frequency === 'monthly'
    const navy: Rgb = [0.07, 0.09, 0.15]
    const grey: Rgb = [0.29, 0.33, 0.39]
    const red: Rgb = [0.75, 0.22, 0.17]

    const lines: PdfLine[] = [
        { text: 'DOCUMENT FICTIF DE DÉMONSTRATION : AUCUNE VALEUR FISCALE', x: 50, y: 806, size: 10, bold: true, color: [1, 1, 1] },
        { text: 'Reçu au titre des dons', x: 50, y: 750, size: 20, bold: true },
        { text: 'Articles 200 et 238 bis du Code général des impôts (modèle de démonstration)', x: 50, y: 730, size: 10, color: grey },
        { text: `${association.name} (association fictive)`, x: 50, y: 690, size: 12, bold: true },
        { text: association.address ?? 'Lyon, France', x: 50, y: 674, size: 10, color: grey },
        { text: `Reçu n° ${donation.reference}`, x: 400, y: 690, size: 11, bold: true },
        { text: `Date du don : ${formatDate(donation.createdAt)}`, x: 400, y: 674, size: 10, color: grey },
        { text: 'Donateur', x: 50, y: 630, size: 12, bold: true },
        { text: donation.fullName, x: 50, y: 612 },
        { text: donation.email, x: 50, y: 596, color: grey },
        { text: 'Don', x: 50, y: 556, size: 12, bold: true },
        { text: `Montant : ${formatEuros(donation.amount)}${monthly ? ' par mois (don mensuel)' : ''}`, x: 50, y: 538 },
        { text: `Projet soutenu : ${projectTitle(donation.project)}`, x: 50, y: 522 },
        { text: 'Forme : don en numéraire, sans contrepartie', x: 50, y: 506 },
        { text: `Réduction d’impôt de 66 % : ${formatEuros(reduction)}${monthly ? ' par mois' : ''}`, x: 50, y: 466, size: 13, bold: true },
        { text: `Coût réel après réduction : ${formatEuros(donation.amount - reduction)}${monthly ? ' par mois' : ''}`, x: 50, y: 448 },
        { text: 'Dans la limite de 20 % du revenu imposable (règle française, à titre d’exemple).', x: 50, y: 430, size: 10, color: grey },
        { text: 'Ce reçu a été généré par la démonstration du site Élan Solidaire.', x: 50, y: 120, size: 10, color: red },
        { text: 'Aucun don n’a été encaissé : ce document ne peut pas être joint à une déclaration de revenus.', x: 50, y: 104, size: 10, color: red },
    ]
    const boxes: PdfBox[] = [{ x: 0, y: 794, width: 595, height: 48, color: navy }]

    const url = URL.createObjectURL(buildPdf(lines, boxes))
    const link = document.createElement('a')
    link.href = url
    link.download = `recu-fiscal-${donation.reference}.pdf`
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
