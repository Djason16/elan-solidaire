import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/api'

/**
 * Data of a public page: the version built into the HTML (getStaticProps, read by search engines and shown at once),
 * then the version of this browser, which includes what the visitor changed in the demo (a product added in the admin).
 *
 *   const { data, loading, reload } = useApiData('/locations', props.locations)
 *
 * @param endpoint - Route of the API; null waits (nothing is loaded).
 * @param [initialData=null] - Response built into the page.
 */
export function useApiData<T extends object>(endpoint: string | null | undefined, initialData: T | null = null) {
    const [data, setData] = useState<T | null>(initialData)
    const [loading, setLoading] = useState(!initialData && Boolean(endpoint))
    const [error, setError] = useState('')

    const reload = useCallback(async () => {
        if (!endpoint) return
        setLoading(true)
        const result = await api.get<T>(endpoint)
        if (result.success) {
            setData(result)
            setError('')
        } else {
            setError(result.error)
        }
        setLoading(false)
    }, [endpoint])

    useEffect(() => {
        let cancelled = false
        if (!endpoint) return undefined
        // An answer of an older endpoint (fast filter changes) is ignored
        api.get<T>(endpoint).then((result) => {
            if (cancelled) return
            if (result.success) setData(result)
            else setError(result.error)
            setLoading(false)
        })
        return () => { cancelled = true }
    }, [endpoint])

    return { data, loading, error, reload }
}
