import { Fragment } from 'react'

/**
 * Text with highlighted words, written as plain data instead of HTML (the original site injected these texts with
 * v-html): the parts alternate plain text and highlighted text, and "\n" makes a line break.
 *
 *   <Marked parts={['Une ', 'main tendue', ' pour un ', 'vrai élan', ' !']} />
 *   -> Une <mark>main tendue</mark> pour un <mark>vrai élan</mark> !
 *
 * @param props - Even indexes plain, odd indexes highlighted.
 */
export default function Marked({ parts }: { parts: string[] }) {
    return parts.map((part, index) => {
        const lines = part.split('\n').map((line, lineIndex) => (
            <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</Fragment>
        ))
        return index % 2 ? <mark key={index}>{lines}</mark> : <Fragment key={index}>{lines}</Fragment>
    })
}
