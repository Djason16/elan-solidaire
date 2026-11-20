/**
 * Very small PDF writer (one A4 page, text only, Helvetica): enough for the fictional tax receipt, without any library.
 * Loaded only when the visitor clicks "Télécharger le reçu" (dynamic import in utils/receipt/receipt.js).
 * @module utils/receipt/pdf
 */

// Characters of WinAnsiEncoding outside Latin-1 (the encoding of the standard PDF fonts)
export type Rgb = [number, number, number]

/** A line of text of the page (PDF units: points from the bottom left corner). */
export interface PdfLine {
    text: string
    x: number
    y: number
    size?: number
    bold?: boolean
    color?: Rgb
}

/** A filled rectangle. */
export interface PdfBox {
    x: number
    y: number
    width: number
    height: number
    color: Rgb
}

const WIN_ANSI: Record<string, number> = { '€': 0x80, '…': 0x85, '–': 0x96, '—': 0x97, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, ' ': 0xA0 }

/** Text of a PDF string: WinAnsi bytes, with ( ) and \ escaped. */
const encode = (text: string) => [...String(text)].flatMap((char) => {
    const code = WIN_ANSI[char] ?? char.charCodeAt(0)
    const byte = code < 256 ? code : 0x3F
    return byte === 0x28 || byte === 0x29 || byte === 0x5C ? [0x5C, byte] : [byte]
})

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0))

/**
 * Builds a one page PDF.
 * @param lines
 *   Points from the bottom left corner of an A4 page (595 x 842).
 * @param [boxes] - Filled rectangles.
 */
export function buildPdf(lines: PdfLine[], boxes: PdfBox[] = []): Blob {
    const content: number[] = []
    const rgb = ([r, g, b]: Rgb) => `${r} ${g} ${b}`
    for (const box of boxes) content.push(...ascii(`${rgb(box.color)} rg ${box.x} ${box.y} ${box.width} ${box.height} re f\n`))
    for (const line of lines) {
        content.push(...ascii(`BT ${rgb(line.color ?? [0.07, 0.09, 0.15])} rg /${line.bold ? 'F2' : 'F1'} ${line.size ?? 11} Tf ${line.x} ${line.y} Td (`))
        content.push(...encode(line.text))
        content.push(...ascii(') Tj ET\n'))
    }

    const objects: number[][] = [
        ascii('<< /Type /Catalog /Pages 2 0 R >>'),
        ascii('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
        ascii('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>'),
        ascii('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),
        ascii('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'),
        [...ascii(`<< /Length ${content.length} >>\nstream\n`), ...content, ...ascii('\nendstream')],
    ]

    const bytes = [...ascii('%PDF-1.4\n')]
    const offsets: number[] = []
    objects.forEach((body, index) => {
        offsets.push(bytes.length)
        bytes.push(...ascii(`${index + 1} 0 obj\n`), ...body, ...ascii('\nendobj\n'))
    })
    const xref = bytes.length
    bytes.push(...ascii(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`))
    offsets.forEach((offset) => bytes.push(...ascii(`${String(offset).padStart(10, '0')} 00000 n \n`)))
    bytes.push(...ascii(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`))
    return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
}
