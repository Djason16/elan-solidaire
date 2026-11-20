import type { KeyboardEvent } from 'react'
import type { MediaItem } from '@/utils/types'
import { useId, useState } from 'react'
import Scrollbar from '@/components/ui/Carousel/Scrollbar'
import SiteImage from '@/components/ui/SiteImage/SiteImage'
import { useReveal } from '@/composables/useReveal'
import { useScrollStrip } from '@/composables/useScrollStrip'
import MediaLightbox from './MediaLightbox'
import { cx } from '@/utils/cx'

/**
 * Photos of the field in a horizontal strip with the carousel scrollbar (original design); a click opens the
 * photo larger. The strip snaps on a photo at each stop; the arrows move one photo, the thumb can be dragged, and the
 * keyboard arrows work on the strip and on the scrollbar.
 * @param props - Photos of GET /media.
 */
export default function HomeMedias({ media }: { media: MediaItem[] }) {
    const [ref, visible] = useReveal<HTMLDivElement>()
    const [stripRef, strip] = useScrollStrip<HTMLUListElement>()
    const stripId = useId()
    const [opened, setOpened] = useState<MediaItem | null>(null)

    if (!media.length) return null

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); strip.next() }
        if (event.key === 'ArrowLeft') { event.preventDefault(); strip.prev() }
    }

    return (
        <div ref={ref} className="photos-index">
            {/* The strip itself takes the focus: the arrow keys scroll it (a focusable region with a name) */}
            <ul ref={stripRef} id={stripId} className={cx('media-grid', 'scroll-x', visible && 'is-visible')}
                tabIndex={0} aria-label="Photos du terrain" onKeyDown={onKeyDown}>
                {media.map((photo) => (
                    <li key={photo.id} className="media-item">
                        <button type="button" className="media-button" onClick={() => setOpened(photo)} title={`Agrandir : ${photo.title}`}>
                            <SiteImage src={photo.src} alt={photo.alt} title={photo.title} width="250" height="250" sizes="250px" />
                        </button>
                    </li>
                ))}
            </ul>
            {strip.scrollable && (
                <Scrollbar label="Photos" controls={stripId} value={strip.progress} size={strip.visible}
                    valueText={`${Math.round(strip.progress * 100)} %`}
                    prevDisabled={strip.atStart} nextDisabled={strip.atEnd}
                    onPrev={strip.prev} onNext={strip.next} onSeek={strip.seek} />
            )}
            <MediaLightbox photo={opened} onClose={() => setOpened(null)} />
        </div>
    )
}
