/** Small unions shared by the other type files. */
export type PaymentMethod = 'card' | 'paypal' | 'transfer'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type PayableKind = 'donation' | 'membership' | 'order'
export type ToastType = 'success' | 'error' | 'info'
export type Role = 'admin' | 'member'
