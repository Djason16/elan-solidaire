/*
 * Small security helpers of the demo layer (Web Crypto API of the browser).
 * A real API would hash passwords with bcrypt or Argon2 on the server: here the hash only keeps the demo
 * passwords out of the code and of localStorage in clear.
 */
const SALT = 'elan-solidaire:'

const toHex = (buffer: ArrayBuffer | Uint8Array) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')

/** SHA-256 of the salted password, in hexadecimal. */
export const hashPassword = async (password: string) =>
    toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + password)))

/** Random token of 32 hexadecimal characters (payment tokens, password reset links, unsubscribe links). */
export const randomToken = (): string => toHex(crypto.getRandomValues(new Uint8Array(16)))
