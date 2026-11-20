import Seo from '@/components/ui/Seo/Seo'
import LoginView from '@/components/views/Login/LoginView'

/**
 * Forgotten password page: the form that sends a reset link (valid one hour, used once).
 */
export default function ForgotPasswordPage() {
    return (
        <>
            <Seo pageKey="forgotPassword" />
            <LoginView mode="forgot" />
        </>
    )
}
