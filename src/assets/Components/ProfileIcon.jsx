import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    UserRound,
    User,
    Package,
    LogOut,
    LoaderCircle,
    X,
    AlertCircle
} from 'lucide-react'

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from 'firebase/auth'

import { auth } from '../../firebase'
import ThemeSwitcher from './ThemeSwitcher'

const ProfileIcon = ({ user, profileChecking, profileError, onRetry }) => {

    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const dropdownRef = useRef(null)
    const handleGoogleLogin = async () => {



        if (loading) return

        setLoading(true)
        setError('')

        try {

            const provider = new GoogleAuthProvider()

            provider.setCustomParameters({
                prompt: 'select_account'
            })

            await signInWithPopup(auth, provider)

            setIsOpen(false)

        } catch (err) {

            console.error('Google Sign-in Error:', err)

            const messages = {
                'auth/popup-closed-by-user':
                    'Login cancelled. Please try again.',

                'auth/popup-blocked':
                    'Please allow popups in your browser.',

                'auth/network-request-failed':
                    'Check your internet connection.',

                'auth/unauthorized-domain':
                    'This domain is not authorized.',

                'auth/cancelled-popup-request':
                    'Another login request is already in progress.',

                'auth/account-exists-with-different-credential':
                    'An account already exists with another sign-in method.',

                'auth/operation-not-allowed':
                    'Google sign-in is not enabled.'
            }

            setError(
                messages[err.code] ||
                'Something went wrong. Please try again.'
            )

        } finally {

            setLoading(false)

        }

    }

    const handleLogout = async () => {

        try {

            await signOut(auth)
            setIsOpen(false)
            setError('')

        } catch (err) {

            console.error('Logout Error:', err)

            setError('Unable to logout. Please try again.')

        }

    }

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }

        }

        const handleEscape = (event) => {

            if (event.key === 'Escape') {
                setIsOpen(false)
            }

        }

        document.addEventListener('pointerdown', handleOutsideClick)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('pointerdown', handleOutsideClick)
            document.removeEventListener('keydown', handleEscape)
        }

    }, [])

    return (


        <div ref={dropdownRef} className="relative">

            {/* Profile Button */}

            <button
                onClick={() => {
                    setIsOpen(prev => !prev)
                    setError('')
                }}
                aria-label="Profile menu"
                aria-expanded={isOpen}
                className={`
                    flex items-center justify-center
                    ${user
                        ? 'w-9 h-9 rounded-full overflow-hidden'
                        : 'px-4 py-2 rounded-xl'
                    }
                    bg-surface border border-border
                    hover:border-primary/60
                    hover:bg-surface-elevated
                    active:scale-95
                    transition-all duration-300
                `}
            >

                {user ? (

                    user.photoURL ? (

                        <img
                            src={user.photoURL}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full"
                        />

                    ) : (

                        <UserRound
                            size={21}
                            className="text-text-secondary"
                        />

                    )

                ) : (

                    <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                        Log In
                    </span>

                )}

            </button>


            {/* Dropdown */}

            <div
                className={`
                    absolute top-full -right-13 sm:right-0 mt-3
                    w-72 max-w-[calc(100vw-2rem)]
                    bg-surface border border-border
                    rounded-2xl shadow-2xl shadow-black/30
                    overflow-hidden origin-top-right
                    transition-all duration-300 ease-out
                    ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0 visible'
                        : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                    }
                `}
            >

                {!user ? (

                    /* LOGGED OUT */

                    <div className="p-5">

                        <div className="flex justify-between items-center mb-5">

                            <div>

                                <h3 className="text-lg font-semibold text-text-primary">
                                    Welcome!
                                </h3>

                                <p className="text-xs text-text-muted mt-1">
                                    Sign in to continue
                                </p>

                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="text-text-muted hover:text-text-primary"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="
                                w-full flex items-center justify-center gap-3
                                px-4 py-3 rounded-xl
                                bg-primary text-background
                                font-semibold text-sm
                                hover:bg-primary-hover
                                active:scale-[0.98]
                                disabled:opacity-60
                                transition-all duration-300
                            "
                        >

                            {loading ? (

                                <LoaderCircle
                                    size={19}
                                    className="animate-spin"
                                />

                            ) : (

                                <svg viewBox="0 0 48 48" className="w-5 h-5">

                                    <path
                                        fill="#FFC107"
                                        d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 32 15l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z"
                                    />

                                    <path
                                        fill="#FF3D00"
                                        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32 15l5.7-5.7A20 20 0 0 0 6.3 14.7Z"
                                    />

                                    <path
                                        fill="#4CAF50"
                                        d="M24 44a20 20 0 0 0 13.4-5.1l-6.2-5.2A12 12 0 0 1 12.9 29l-6.5 5A20 20 0 0 0 24 44Z"
                                    />

                                    <path
                                        fill="#1976D2"
                                        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.7l6.2 5.2A20 20 0 0 0 44 24c0-1.2-.1-2.4-.4-3.5Z"
                                    />

                                </svg>

                            )}

                            {loading ? 'Signing in...' : 'Continue with Google'}

                        </button>


                        {error && (

                            <p className="text-xs text-danger text-center mt-3">
                                {error}
                            </p>

                        )}


                        <p className="text-[11px] text-text-muted text-center mt-4">
                            Secure authentication powered by Google
                        </p>


                        {/* Theme Switcher */}

                        <div className="border-t border-border mt-5 pt-4 flex items-center justify-between">

                            <span className="text-sm text-text-secondary">
                                Appearance
                            </span>

                            <ThemeSwitcher />

                        </div>

                    </div>

                ) : (

                    /* LOGGED IN */

                    <div>

                        {/* User Information */}

                        <div className="p-4 border-b border-border flex items-center gap-3">

                            {user.photoURL ? (

                                <img
                                    src={user.photoURL}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-11 h-11 rounded-full object-cover"
                                />

                            ) : (

                                <div className="w-11 h-11 rounded-full bg-surface-elevated flex items-center justify-center">

                                    <UserRound size={21} />

                                </div>

                            )}


                            <div className="min-w-0">

                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {user.displayName || 'User'}
                                </p>

                                <p className="text-xs text-text-muted truncate">
                                    {user.email}
                                </p>

                            </div>

                        </div>


                        {/* Profile Status */}

                        {profileChecking && (

                            <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs flex items-center gap-2">

                                <LoaderCircle size={14} className="animate-spin" />

                                Checking your profile...

                            </div>

                        )}


                        {profileError && (

                            <div className="mx-3 mt-3 p-3 rounded-lg bg-danger/10 text-danger text-xs">

                                <div className="flex items-center gap-2">

                                    <AlertCircle size={15} />

                                    <span>Profile check failed.</span>

                                </div>

                                <button
                                    onClick={() => {
                                        onRetry?.()
                                    }}
                                    className="underline mt-2"
                                >
                                    Try again
                                </button>

                            </div>

                        )}


                        {/* Menu Items */}

                        <div className="p-2">

                            <Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="
                                    flex items-center gap-3
                                    px-3 py-3 rounded-xl
                                    text-text-secondary
                                    hover:text-primary hover:bg-surface-elevated
                                    transition-all duration-200
                                "
                            >

                                <User size={18} />

                                <span className="text-sm font-medium">
                                    My Profile
                                </span>

                            </Link>


                            <Link
                                to="/orders"
                                onClick={() => setIsOpen(false)}
                                className="
                                    flex items-center gap-3
                                    px-3 py-3 rounded-xl
                                    text-text-secondary
                                    hover:text-primary hover:bg-surface-elevated
                                    transition-all duration-200
                                "
                            >

                                <Package size={18} />

                                <span className="text-sm font-medium">
                                    My Orders
                                </span>

                            </Link>


                            {/* Theme Switcher */}

                            <div className="flex items-center justify-between px-3 py-3">

                                <span className="text-sm text-text-secondary">
                                    Appearance
                                </span>

                                <ThemeSwitcher />

                            </div>


                            <div className="h-px bg-border my-1" />


                            <button
                                onClick={handleLogout}
                                className="
                                    w-full flex items-center gap-3
                                    px-3 py-3 rounded-xl
                                    text-danger hover:bg-danger/10
                                    transition-all duration-200
                                "
                            >

                                <LogOut size={18} />

                                <span className="text-sm font-medium">
                                    Logout
                                </span>

                            </button>

                            {error && (

                                <p className="text-xs text-danger px-3 py-2">
                                    {error}
                                </p>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>

    )

}

export default ProfileIcon