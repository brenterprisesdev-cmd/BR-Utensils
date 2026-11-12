export const getFirebaseErrorMessage = (error, context = 'general') => {

    const code = error?.code || ''

    const commonErrors = {
        'auth/network-request-failed':
            'Internet connection unavailable. Please check your connection.',

        'auth/too-many-requests':
            'Too many attempts. Please wait before trying again.',

        'auth/user-disabled':
            'This account has been disabled. Please contact support.',

        'auth/requires-recent-login':
            'For security, please sign in again and retry.',

        'auth/unauthorized-domain':
            'This website is not authorized for authentication.',

        'permission-denied':
            'You do not have permission to perform this action.',

        'unavailable':
            'Our server is temporarily unavailable. Please try again.',

        'deadline-exceeded':
            'The request took too long. Please try again.',

        'unauthenticated':
            'Your session has expired. Please sign in again.',

        'not-found':
            'The requested information could not be found.'
    }

    const contextErrors = {

        phone: {
            'auth/invalid-phone-number':
                'Please enter a valid mobile number.',

            'auth/invalid-verification-code':
                'Incorrect OTP. Please check and try again.',

            'auth/code-expired':
                'Your OTP has expired. Request a new OTP.',

            'auth/quota-exceeded':
                'SMS verification limit reached. Please try later.',

            'auth/captcha-check-failed':
                'Security verification failed. Please try again.',

            'auth/account-exists-with-different-credential':
                'An account with this number already exists.',
            'auth/credential-already-in-use':
                'This mobile number is already associated with another account.',

            'auth/provider-already-linked':
                'A mobile number is already linked to this account.',

            'auth/invalid-app-credential':
                'Security verification failed. Refresh the page and try again.'
        },

        google: {
            'auth/popup-closed-by-user':
                'Login cancelled.',

            'auth/popup-blocked':
                'Please allow popups in your browser.',

            'auth/account-exists-with-different-credential':
                'An account already exists with another sign-in method.',

            'auth/cancelled-popup-request':
                'Another login request is already in progress.'
        },

        firestore: {
            'permission-denied':
                'Unable to save your information. Please check your account permissions.',

            'not-found':
                'The database resource could not be found.',

            'failed-precondition':
                'The database is not configured correctly.',

            'already-exists':
                'This information already exists.'
        }

    }

    return (
        contextErrors[context]?.[code] ||
        commonErrors[code] ||
        'Something went wrong. Please try again.'
    )
}