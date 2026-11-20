import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import Icon from '@/components/ui/Icon/Icon'
import { chevronDown, chevronLeft, chevronRight, chevronUp } from '@/utils/icons'
import { cx } from '@/utils/cx'

interface ScrollbarProps {
    orientation?: 'vertical' | 'horizontal'
    value: number
    size: number
    onSeek: (fraction: number, instant: boolean) => void
    onPrev: () => void
    onNext: () => void
    prevDisabled?: boolean
    nextDisabled?: boolean
    label?: string
    controls?: string
    valueText?: string
    className?: string
}

/**
 * Scrollbar of the carousels of the original design: two small round arrows around a thin track whose blue thumb
 * shows the position (assets/css/views/home-carousels.css). The track is a real scrollbar control:
 *   - the thumb follows the position with a transform (no layout work while scrolling);
 *   - it can be dragged with a mouse or a finger, and a click on the track moves it there;
 *   - with the keyboard focus, the arrow keys go back and forth, Home and End go to the ends.
 *
 * @param props
 * @param [props.orientation='horizontal']
 * @param props.value - Position, from 0 (start) to 1 (end).
 * @param props.size - Length of the thumb, from 0 to 1 of the track (the visible part).
 * @param props.onSeek - Asked position (instant while dragging).
 * @param props.onPrev
 * @param props.onNext
 * @param [props.prevDisabled=false] - At the start: the "previous" arrow is disabled.
 * @param [props.nextDisabled=false] - At the end: the "next" arrow is disabled.
 * @param [props.label='Défiler'] - Name of the controls for screen readers ("Photos", "Piliers"...).
 * @param [props.controls] - Id of the scrolled element (aria-controls).
 * @param [props.valueText] - Position said by screen readers ("Pilier 2 sur 3").
 * @param [props.className]
 */
export default function Scrollbar({ orientation = 'horizontal', value, size, onSeek, onPrev, onNext, prevDisabled = false, nextDisabled = false, label = 'Défiler', controls, valueText, className = '' }: ScrollbarProps) {
    const vertical = orientation === 'vertical'
    const track = useRef<HTMLDivElement | null>(null)
    const drag = useRef<{ grabOffset: number } | null>(null)
    const [dragging, setDragging] = useState(false)
    const thumbSize = Math.min(1, Math.max(0.08, size))
    const position = Math.min(1, Math.max(0, value))
    // Thumb moved by a percentage of its own length: (track - thumb) * position, in thumb lengths
    const shift = thumbSize >= 1 ? 0 : (position * (1 - thumbSize) / thumbSize) * 100
    const thumbStyle = vertical
        ? { height: `${thumbSize * 100}%`, transform: `translateY(${shift}%)` }
        : { width: `${thumbSize * 100}%`, transform: `translateX(${shift}%)` }

    // Fraction of the track under the pointer, the thumb kept under the finger where it was grabbed
    const fractionAt = (event: PointerEvent, grabOffset: number) => {
        const box = (track.current as HTMLDivElement).getBoundingClientRect()
        const length = vertical ? box.height : box.width
        const point = (vertical ? event.clientY - box.top : event.clientX - box.left) - grabOffset
        const free = length * (1 - thumbSize)
        return free <= 0 ? 0 : Math.min(1, Math.max(0, point / free))
    }

    const onPointerDown = (event: PointerEvent) => {
        const element = track.current
        if (event.button !== 0 || !element) return
        const box = element.getBoundingClientRect()
        const length = vertical ? box.height : box.width
        const thumbLength = length * thumbSize
        const thumbStart = position * (length - thumbLength)
        const pointer = vertical ? event.clientY - box.top : event.clientX - box.left
        const onThumb = pointer >= thumbStart && pointer <= thumbStart + thumbLength
        // On the thumb: dragged from where it was grabbed; elsewhere: the thumb centers on the pointer, then follows it
        const grabOffset = onThumb ? pointer - thumbStart : thumbLength / 2
        drag.current = { grabOffset }
        element.setPointerCapture(event.pointerId)
        setDragging(true)
        // A click on the track glides there; a grab of the thumb follows the pointer at once
        onSeek(fractionAt(event, grabOffset), onThumb)
    }

    const onPointerMove = (event: PointerEvent) => {
        if (!drag.current) return
        onSeek(fractionAt(event, drag.current.grabOffset), true)
    }

    const endDrag = (event: PointerEvent) => {
        const element = track.current
        if (!drag.current) return
        drag.current = null
        setDragging(false)
        if (element?.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    }

    const onKeyDown = (event: KeyboardEvent) => {
        const back = vertical ? 'ArrowUp' : 'ArrowLeft'
        const forward = vertical ? 'ArrowDown' : 'ArrowRight'
        const actions: Record<string, () => void> = { [back]: onPrev, [forward]: onNext, Home: () => onSeek(0, false), End: () => onSeek(1, false) }
        const action = actions[event.key]
        if (!action) return
        event.preventDefault()
        action()
    }

    return (
        <div className={cx('scrollbar-wrapper', `orientation-${orientation}`, className)}>
            <button type="button" className="classic-btn scrollbar-button" disabled={prevDisabled} onClick={onPrev}
                title={`${label} : précédent`} aria-label={`${label} : précédent`}>
                <Icon icon={vertical ? chevronUp : chevronLeft} />
            </button>
            <div ref={track} className={cx('scrollbar-track', dragging && 'is-dragging')} role="scrollbar" tabIndex={0}
                aria-label={label} aria-controls={controls} aria-orientation={orientation}
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(position * 100)} aria-valuetext={valueText}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
                onKeyDown={onKeyDown}>
                <div className="scrollbar-thumb" style={thumbStyle} />
            </div>
            <button type="button" className="classic-btn scrollbar-button" disabled={nextDisabled} onClick={onNext}
                title={`${label} : suivant`} aria-label={`${label} : suivant`}>
                <Icon icon={vertical ? chevronDown : chevronRight} />
            </button>
        </div>
    )
}
