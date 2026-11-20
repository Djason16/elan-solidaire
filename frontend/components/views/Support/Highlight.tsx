import { Fragment } from 'react'

/**
 * Text of the design with highlighted words, without injecting HTML: "**un enfant** équipé" -> <mark>un enfant</mark> équipé.
 * A line break ("\n") becomes <br />. Replaces the v-html of the original components (no XSS possible).
 * @param props
 */
export default function Highlight({ text }: { text: string }) {
    return text.split('\n').map((line, lineIndex) => (
        <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line.split('**').map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : <Fragment key={index}>{part}</Fragment>))}
        </Fragment>
    ))
}
