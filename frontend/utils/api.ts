import { dispatch } from './demo/router'
import type { RequestBody } from './demo/routeTypes'
import type { ApiResult } from './types'

/**
 * Client of the API, with the interface of the DC Scaffold `api` client:
 *
 *   await api.get('/products?page=2')
 *   await api.post('/donations', { fullName, ... })
 *   await api.put('/products/1', data)
 *   await api.delete('/products/1')
 *   await api.download('/donations/export')
 *
 * Every call ends (never throws) with the JSON of the API:
 *   success -> { success: true, ...data }
 *   failure -> { success: false, error: 'message', status: 404, ...fields }
 *
 * This demo has no server: requests are answered in the browser by utils/demo/ (fictional data and localStorage).
 * Pointing the site to a real API means replacing `send` below by a fetch() to its address; the views and stores
 * do not change.
 * @module utils/api
 */

/**
 * Sends one request.
 * @param endpoint - Path and query string: '/products?page=2'.
 * @param [method='GET']
 * @param [body=null] - JSON body.
 * @returns The response of the API.
 */
// `T` is the caller's promise about the shape of the response: the demo API answers plain JSON, like a real one
export const apiRequest = <T extends object = object>(endpoint: string, method = 'GET', body: object | null = null): Promise<ApiResult<T>> =>
    dispatch<T>(endpoint, method, body as RequestBody | null)

/**
 * Downloads a file returned by the API ({ file: { name, type, content } }) through the "Save" window of the browser.
 * @param endpoint
 * @returns or the failure of the API.
 */
const download = async (endpoint: string): Promise<ApiResult> => {
    const result = await apiRequest<{ file: { name: string, type: string, content: string } }>(endpoint)
    if (!result.success) return result

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([result.file.content], { type: result.file.type }))
    link.download = result.file.name
    link.click()
    URL.revokeObjectURL(link.href)
    return { success: true }
}

export const api = {
    get: <T extends object = object>(endpoint: string) => apiRequest<T>(endpoint, 'GET'),
    post: <T extends object = object>(endpoint: string, body?: object) => apiRequest<T>(endpoint, 'POST', body),
    put: <T extends object = object>(endpoint: string, body?: object) => apiRequest<T>(endpoint, 'PUT', body),
    patch: <T extends object = object>(endpoint: string, body?: object) => apiRequest<T>(endpoint, 'PATCH', body),
    delete: <T extends object = object>(endpoint: string) => apiRequest<T>(endpoint, 'DELETE'),
    download,
}
