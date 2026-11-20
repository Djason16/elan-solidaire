/**
 * Image compression of the admin forms: every photo is resized and turned into WebP in the browser
 * before it is sent (lighter pages, smaller storage).
 * @module utils/image
 */

/** Longest side of a sent image (pixels). */
export const MAX_IMAGE_SIDE = 1200

/**
 * Compresses an image file to a WebP data URL.
 * @param file - File chosen by the admin.
 * @param [maxSide=MAX_IMAGE_SIDE]
 * @param [quality=0.8] - WebP quality, 0 to 1.
 * @returns data:image/webp;base64,...
 * @throws When the file is not an image the browser can read.
 */
export const compressImage = async (file: File, maxSide = MAX_IMAGE_SIDE, quality = 0.8): Promise<string> => {
    if (!file.type.startsWith('image/')) throw new Error('Choisissez une image (JPEG, PNG ou WebP)')
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return canvas.toDataURL('image/webp', quality)
}
