import type { LatLngTuple, Map as LeafletMap, Marker } from 'leaflet'
import type { Place } from '@/utils/types'
import 'leaflet/dist/leaflet.css'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import FormField from '@/components/ui/FormField/FormField'
import { projectTitle } from '@/utils/content/programs'
import { formatNumber } from '@/utils/format'
import { cx } from '@/utils/cx'
import { locationDot } from '@/utils/icons'

const TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
// Alt and title of each tile of the map
const TILE_TEXT = 'Fond de carte OpenStreetMap des lieux d’action'
// Zoom of a place found by the search
const PLACE_ZOOM = 5
// Under this distance the map glides (pan and zoom) instead of flying out and back in
const NEAR_METERS = 2500 * 1000
// Pause in the typing before the map moves (one move for a word, not one per letter)
const SEARCH_PAUSE = 250
// Durations of the moves, in seconds: kept short, the search answers while the visitor is still looking (2026-11-26:
// the flight of 2.6 s, --motion-slow × 2, was judged too slow)
const GLIDE_SECONDS = 0.5
const FLIGHT_SECONDS = 0.9

/**
 * Moves the map to a place: a short glide when the place is near, a quick flight when it is far, nothing animated with
 * prefers-reduced-motion.
 * @param map - Leaflet map.
 * @param target
 */
const moveTo = (map: LeafletMap, target: LatLngTuple) => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return map.setView(target, PLACE_ZOOM, { animate: false })
    if (map.distance(map.getCenter(), target) < NEAR_METERS) return map.setView(target, PLACE_ZOOM, { animate: true, duration: GLIDE_SECONDS })
    return map.flyTo(target, PLACE_ZOOM, { duration: FLIGHT_SECONDS, easeLinearity: 0.25 })
}
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" title="Licence des données OpenStreetMap" rel="noopener noreferrer">OpenStreetMap</a>'
// Black location pin of the original design, drawn inline (no marker image is downloaded)
const PIN = `<svg viewBox="${locationDot[0]}" width="28" height="36" aria-hidden="true"><path fill="#111827" d="${locationDot[1]}"/></svg>`

const normalize = (text: string) => String(text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * One line of a popup: label and value, built with textContent (names typed in the admin are never read as HTML).
 */
const infoLine = (label: string, value: string, className = '') => {
    const line = document.createElement('div')
    line.className = cx('popup-info gap-m', className)
    const name = document.createElement('span')
    name.className = 'popup-label text-smaller text-semibold'
    name.textContent = label
    const amount = document.createElement('span')
    amount.className = 'popup-value text-small text-bold'
    amount.textContent = value
    line.append(name, amount)
    return line
}

/**
 * Content of the popup of a place (original design: city, rule, country, then highlighted figures).
 * @param place - Place of GET /locations.
 */
const popupContent = (place: Place) => {
    const box = document.createElement('div')
    box.className = 'popup-content gap-xs text-small'
    const title = document.createElement('h3')
    title.className = 'popup-city text-normal text-bold'
    title.textContent = place.city
    const divider = document.createElement('div')
    divider.className = 'popup-divider'
    box.append(title, divider, infoLine('Pays', place.country), infoLine('Programme', projectTitle(place.program)),
        infoLine(place.centers > 1 ? 'Centres' : 'Centre', String(place.centers), 'highlight'),
        infoLine('Enfants accompagnés', formatNumber(place.children), 'highlight-children'))
    return box
}

/**
 * Interactive Leaflet map with the search field floating at the top left and the zoom at the top right (original
 * design). Loaded only in the browser, after consent (HomeMap). Typing a city flies to it and opens its popup.
 * @param props
 */
export default function ActionsMap({ locations }: { locations: Place[] }) {
    const element = useRef<HTMLDivElement | null>(null)
    const map = useRef<LeafletMap | null>(null)
    const leaflet = useRef<typeof import('leaflet') | null>(null)
    const markers = useRef(new Map<number, Marker>())
    const [search, setSearch] = useState('')

    // Draws the pins of the current places and frames them all (reads the latest props, not an effect dependency)
    const drawMarkers = useEffectEvent(() => {
        const L = leaflet.current
        if (!L || !map.current) return
        markers.current.forEach((marker) => marker.remove())
        markers.current.clear()
        const icon = L.divIcon({ className: 'map-pin', html: PIN, iconSize: [28, 36], iconAnchor: [14, 34], popupAnchor: [0, -32] })
        locations.forEach((place) => {
            const marker = L.marker([place.latitude, place.longitude], { icon, title: `${place.city}, ${place.country}`, alt: `Repère ${place.city}` })
                .bindPopup(popupContent(place), { closeButton: false, maxWidth: 280, minWidth: 0, autoPanPadding: [16, 64] })
                .addTo(map.current as LeafletMap)
            markers.current.set(place.id, marker)
        })
        if (locations.length) map.current.fitBounds(L.latLngBounds(locations.map((place) => [place.latitude, place.longitude])), { padding: [40, 40], maxZoom: 6 })
    })

    // Creates the map once, when Leaflet is downloaded
    useEffect(() => {
        let cancelled = false
        import('leaflet').then(({ default: L }) => {
            if (cancelled) return
            leaflet.current = L
            // On a touch screen one finger scrolls the page, never the map (zoom buttons and search stay)
            map.current = L.map(element.current as HTMLDivElement, { scrollWheelZoom: false, zoomControl: false, worldCopyJump: true, dragging: !L.Browser.mobile }).setView([12, 5], 2)
            L.control.zoom({ position: 'topright' }).addTo(map.current)
            // More tiles kept around the view, loaded once a move ends: no empty area while flying from place to place
            // Leaflet draws each tile as an <img alt=""> with no title: every image of the site has both (rule of all sites)
            L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 12, keepBuffer: 4, updateWhenZooming: false, updateWhenIdle: true })
                .on('tileloadstart', ({ tile }: { tile: HTMLImageElement }) => {
                    tile.alt = TILE_TEXT
                    tile.title = TILE_TEXT
                })
                .addTo(map.current)
            drawMarkers()
        })
        return () => {
            cancelled = true
            map.current?.remove()
            map.current = null
        }
    }, [])

    // The pins follow the places (a place added or hidden in the admin)
    useEffect(() => drawMarkers(), [locations])

    // Search: the first place whose city or country has a word starting with the text, once typing pauses. The popup
    // opens only when the move is over: opened during a flight, its auto-pan stopped the map halfway (grey tiles, popup
    // in a corner, seen on 2026-11-26 typing « Mad »). The place already shown is not flown to again on every letter.
    const shown = useRef<number | null>(null)
    const arrived = useRef<(() => void) | null>(null)
    useEffect(() => {
        const text = normalize(search).trim()
        if (!text) {
            shown.current = null
            return
        }
        const timer = window.setTimeout(() => {
            const current = map.current
            if (!current) return
            const place = locations.find((candidate) => normalize(`${candidate.city} ${candidate.country}`)
                .split(/[\s,'’-]+/).some((word) => word.startsWith(text)))
                ?? locations.find((candidate) => normalize(`${candidate.city} ${candidate.country}`).includes(text))
            if (!place || place.id === shown.current) return
            shown.current = place.id
            current.closePopup()
            // Only our own listener is removed (the tiles listen to moveend too)
            if (arrived.current) current.off('moveend', arrived.current)
            // A flight still going is stopped first: stopping it fires its own moveend, which must not open this popup
            current.stop()
            arrived.current = () => {
                arrived.current = null
                if (shown.current === place.id) markers.current.get(place.id)?.openPopup()
            }
            current.once('moveend', arrived.current)
            const target: LatLngTuple = [place.latitude, place.longitude]
            // Already there (same view): no move, so no moveend: the popup opens at once
            if (current.getCenter().distanceTo(target) < 1 && current.getZoom() === PLACE_ZOOM) current.fire('moveend')
            else moveTo(current, target)
        }, SEARCH_PAUSE)
        return () => window.clearTimeout(timer)
    }, [search, locations])

    return (
        <>
            <div className="map-search">
                <FormField label="Ville ou pays" hideLabel name="map-search" type="search" value={search}
                    onChange={(_, value) => setSearch(String(value))} placeholder="Ville ou pays" autoComplete="off" />
            </div>
            <div ref={element} className="map-wrapper" role="region" aria-label="Carte interactive des lieux d’action" />
        </>
    )
}
