import Seo from '@/components/ui/Seo/Seo'
import LoginView from '@/components/views/Login/LoginView'

/**
 * Login page (also the page of the password reset link).
 */
export default function Login() {
    return (
        <>
            <Seo pageKey="login" />
            <LoginView />
        </>
    )
}
