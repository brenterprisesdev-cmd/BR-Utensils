import React, { useEffect, useState } from 'react'

import {
    Link,
    NavLink
} from 'react-router-dom'

import {
    ShoppingCart,
    AlertCircle,
    LoaderCircle
} from 'lucide-react'

import {
    onAuthStateChanged
} from 'firebase/auth'

import {
    doc,
    getDoc
} from 'firebase/firestore'

import { auth, db } from '../../firebase'

import NavHamburger from './NavHamburger'
import ProfileIcon from './ProfileIcon'
import ProfileSetupForm from './ProfileSetupForm'


const NavBar = () => {

    const [user, setUser] = useState(null)

    const [profileChecking, setProfileChecking] = useState(false)

    const [showProfileSetup, setShowProfileSetup] = useState(false)

    const [profileError, setProfileError] = useState('')

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'Products', path: '/products' },
    ]


    // Check Firestore Profile

    const checkUserProfile = async (currentUser) => {

        if (!currentUser) return

        setProfileChecking(true)
        setProfileError('')

        try {

            const profileRef = doc(
                db,
                'users',
                currentUser.uid,
                'details',
                'profile'
            )

            const profileSnapshot = await getDoc(profileRef)

            if (!profileSnapshot.exists()) {

                setShowProfileSetup(true)

                return

            }

            const profileData = profileSnapshot.data()

            if (profileData.profileCompleted !== true) {

                setShowProfileSetup(true)

            } else {

                setShowProfileSetup(false)

            }

        } catch (error) {

            console.error('Profile Check Error:', error)

            setProfileError(
                'Unable to verify your profile. Check your connection and try again.'
            )

        } finally {

            setProfileChecking(false)

        }

    }


    // Firebase Authentication Listener

    useEffect(() => {

        let active = true

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

            if (!active) return

            setUser(currentUser)

            if (!currentUser) {

                setShowProfileSetup(false)
                setProfileError('')
                setProfileChecking(false)

                return

            }

            setProfileChecking(true)
            setProfileError('')

            try {

                const profileRef = doc(
                    db,
                    'users',
                    currentUser.uid,
                    'details',
                    'profile'
                )

                const profileSnapshot = await getDoc(profileRef)

                if (!active) return

                if (
                    !profileSnapshot.exists() ||
                    profileSnapshot.data().profileCompleted !== true
                ) {

                    setShowProfileSetup(true)

                } else {

                    setShowProfileSetup(false)

                }

            } catch (error) {

                if (!active) return

                console.error('Profile Check Error:', error)

                setProfileError(
                    'Unable to verify your profile. Please try again.'
                )

            } finally {

                if (active) {
                    setProfileChecking(false)
                }

            }

        })

        return () => {

            active = false
            unsubscribe()

        }

    }, [])


    // Profile Completed

    const handleProfileComplete = () => {

        setShowProfileSetup(false)
        setProfileError('')

    }


    // Retry Profile Check

    const handleRetry = () => {

        if (user) {
            checkUserProfile(user)
        }

    }


    const linkClasses = ({ isActive }) => `

        relative px-3 py-2 rounded-lg
        text-sm font-medium
        transition-all duration-300 ease-out
        group

        ${
            isActive
                ? 'text-primary bg-primary/10'
                : 'text-text-secondary hover:text-primary hover:bg-surface-elevated'
        }

    `


    return (

        <>

            <header className="
                fixed top-0 right-0 z-50
                w-full
                flex items-center justify-between
                px-4 sm:px-8 py-3
                bg-surface/95 backdrop-blur-xl
                border-b border-border
                shadow-lg shadow-black/5
                animate-[navEnter_0.6s_ease-out]
            ">


                {/* Logo */}

                <Link
                    to="/"
                    className="
                        group shrink-0
                        transition-transform duration-300
                        hover:scale-[1.04]
                        active:scale-95
                    "
                >

                    <img
                        className="h-8 sm:h-10 w-auto object-contain"
                        src="/long_logo.png"
                        alt="BR Utensils"
                    />

                </Link>


                {/* Desktop Navigation */}

                <nav className="
                    hidden sm:flex
                    items-center justify-between
                    gap-0 md:gap-2 lg:gap-3
                ">

                    {navLinks.map((link) => (

                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === '/'}
                            className={linkClasses}
                        >

                            {({ isActive }) => (

                                <>

                                    <span className="relative z-10">
                                        {link.name}
                                    </span>

                                    <span
                                        className={`
                                            absolute bottom-1 left-1 right-1
                                            h-[2px] rounded-full
                                            bg-primary
                                            transition-all duration-300
                                            origin-left

                                            ${
                                                isActive
                                                    ? 'scale-x-100 opacity-100'
                                                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70'
                                            }
                                        `}
                                    />

                                </>

                            )}

                        </NavLink>

                    ))}

                </nav>


                {/* Right Actions */}

                <div className="
                    flex items-center justify-between
                    gap-2
                ">


                    {/* Cart */}

                    <Link
                        to="/cart"
                        aria-label="Shopping Cart"
                        className="
                            relative
                            w-9 h-9
                            flex items-center justify-center
                            rounded-xl
                            bg-surface
                            border border-border
                            text-text-secondary
                            hover:text-primary
                            hover:border-primary/60
                            hover:bg-surface-elevated
                            active:scale-95
                            transition-all duration-300
                        "
                    >

                        <ShoppingCart size={19} />

                    </Link>


                    {/* Profile */}

                    <ProfileIcon
                        user={user}
                        profileChecking={profileChecking}
                        profileError={profileError}
                        onRetry={handleRetry}
                    />


                    {/* Mobile Navigation */}

                    <NavHamburger />

                </div>


                {/* Profile Check Error */}

                {profileError && (

                    <div className="
                        absolute top-full right-4 mt-2
                        flex items-center gap-2
                        px-3 py-2
                        rounded-lg
                        bg-danger/10
                        border border-danger/20
                        text-danger text-xs
                        shadow-lg
                    ">

                        <AlertCircle size={15} />

                        Profile verification failed

                    </div>

                )}

            </header>


            {/* Profile Setup */}

            {showProfileSetup && user && (

                <ProfileSetupForm
                    onClose={() => setShowProfileSetup(false)}
                    onComplete={handleProfileComplete}
                />

            )}


            {/* Entrance Animation */}

            <style>{`

                @keyframes navEnter {

                    from {
                        opacity: 0;
                        transform: translateY(-15px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }

                }

                @media (prefers-reduced-motion: reduce) {

                    *,
                    *::before,
                    *::after {

                        animation-duration: 0.01ms !important;
                        transition-duration: 0.01ms !important;

                    }

                }

            `}</style>

        </>

    )

}

export default NavBar