import React, { useEffect, useRef, useState } from 'react'

import {
    UserRound,
    Phone,
    MapPin,
    ArrowRight,
    ArrowLeft,
    Check,
    LoaderCircle,
    ShieldCheck,
    Pencil,
    Mail,
    AlertCircle,
    X,
    AlertTriangle
} from 'lucide-react'

import {
    onAuthStateChanged,
    RecaptchaVerifier,
    PhoneAuthProvider,
    linkWithPhoneNumber,
    updatePhoneNumber,
    signOut
} from 'firebase/auth'

import {
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore'

import { auth, db } from '../../firebase'

import { getFirebaseErrorMessage } from '../../utils/firebaseErrors'


const ProfileSetupForm = ({ onClose, onComplete }) => {

    // --------------------------------------------------
    // STATES
    // --------------------------------------------------

    const [user, setUser] = useState(null)

    const [step, setStep] = useState(1)

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState('')

    const [success, setSuccess] = useState(false)

    const [otp, setOtp] = useState('')

    const [verificationId, setVerificationId] = useState(null)

    const [verified, setVerified] = useState(false)

    const [countdown, setCountdown] = useState(0)

    const [isEditingPhone, setIsEditingPhone] = useState(false)

    const [showChangeConfirmation, setShowChangeConfirmation] = useState(false)

    const [reloadCountdown, setReloadCountdown] = useState(null)

    const [form, setForm] = useState({
        name: '',
        phone: '',
        alternatePhone: '',
        address: '',
        landmark: ''
    })

    const [fieldErrors, setFieldErrors] = useState({})


    // --------------------------------------------------
    // REFS
    // --------------------------------------------------

    const recaptchaVerifierRef = useRef(null)

    const recaptchaContainerRef = useRef(null)

    const confirmationRef = useRef(null)

    const reloadTimerRef = useRef(null)

    const isMountedRef = useRef(true)


    // --------------------------------------------------
    // AUTH LISTENER
    // --------------------------------------------------

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, currentUser => {

            if (!isMountedRef.current) return

            setUser(currentUser)

            if (currentUser) {

                setForm(prev => ({
                    ...prev,

                    name: currentUser.displayName || prev.name,

                    phone: currentUser.phoneNumber
                        ? currentUser.phoneNumber.replace('+91', '')
                        : prev.phone
                }))

                setVerified(Boolean(currentUser.phoneNumber))

            }

        })

        return () => unsubscribe()

    }, [])


    // --------------------------------------------------
    // COMPONENT CLEANUP
    // --------------------------------------------------

    useEffect(() => {

        isMountedRef.current = true

        return () => {

            isMountedRef.current = false

            clearTimeout(reloadTimerRef.current)

            try {
                recaptchaVerifierRef.current?.clear()
            } catch (err) {
                console.warn('reCAPTCHA cleanup:', err)
            }

        }

    }, [])


    // --------------------------------------------------
    // OTP COUNTDOWN
    // --------------------------------------------------

    useEffect(() => {

        if (countdown <= 0) return

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1)
        }, 1000)

        return () => clearTimeout(timer)

    }, [countdown])


    // --------------------------------------------------
    // AUTOMATIC PAGE RELOAD COUNTDOWN
    // --------------------------------------------------

    useEffect(() => {

        if (reloadCountdown === null) return

        if (reloadCountdown <= 0) {

            window.location.reload()

            return

        }

        reloadTimerRef.current = setTimeout(() => {

            setReloadCountdown(prev => prev - 1)

        }, 1000)

        return () => clearTimeout(reloadTimerRef.current)

    }, [reloadCountdown])


    // --------------------------------------------------
    // ERROR HANDLER
    // --------------------------------------------------

    const handleError = (err, context = 'general') => {

        console.error(`[${context}]`, err)

        const errorText = [
            err?.code || '',
            err?.message || ''
        ].join(' ')

        const isRecaptchaRenderError =
            /already rendered|reCAPTCHA.*rendered|reCAPTCHA container/i.test(errorText)

        if (isRecaptchaRenderError) {

            resetRecaptcha()

            setError(
                'Security verification needs to be refreshed. Reloading the page...'
            )

            setReloadCountdown(3)

            return

        }

        setError(getFirebaseErrorMessage(err, context))

    }


    // --------------------------------------------------
    // RESET RECAPTCHA
    // --------------------------------------------------

    const resetRecaptcha = () => {

        try {

            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear()
            }

        } catch (err) {

            console.warn('reCAPTCHA reset error:', err)

        } finally {

            recaptchaVerifierRef.current = null

            if (recaptchaContainerRef.current) {
                recaptchaContainerRef.current.innerHTML = ''
            }

        }

    }


    // --------------------------------------------------
    // CREATE RECAPTCHA
    // --------------------------------------------------

    const createRecaptcha = async () => {

        if (!auth.currentUser) {
            throw new Error('Please sign in again.')
        }

        if (!recaptchaContainerRef.current) {
            throw new Error('Verification component is unavailable.')
        }

        resetRecaptcha()

        const verifier = new RecaptchaVerifier(
            auth,
            recaptchaContainerRef.current,
            {
                size: 'invisible',

                callback: () => {
                    console.log('reCAPTCHA verified')
                },

                'expired-callback': () => {

                    resetRecaptcha()

                    setError(
                        'Security verification expired. Please request OTP again.'
                    )

                }
            }
        )

        recaptchaVerifierRef.current = verifier

        await verifier.render()

        return verifier

    }


    // --------------------------------------------------
    // FORM UPDATE
    // --------------------------------------------------

    const updateField = (field, value) => {

        setForm(prev => ({
            ...prev,
            [field]: value
        }))

        setFieldErrors(prev => ({
            ...prev,
            [field]: ''
        }))

        setError('')

    }


    // --------------------------------------------------
    // CHANGE PHONE CONFIRMATION
    // --------------------------------------------------

    const handleChangePhone = () => {

        if (loading) return

        setShowChangeConfirmation(true)

    }


    const confirmChangePhone = () => {

        setShowChangeConfirmation(false)

        setIsEditingPhone(true)

        setVerified(false)

        setVerificationId(null)

        confirmationRef.current = null

        setOtp('')

        setCountdown(0)

        setError('')

        setFieldErrors({})

        resetRecaptcha()

    }


    const cancelChangePhone = () => {

        setShowChangeConfirmation(false)

    }


    // --------------------------------------------------
    // VALIDATE PHONE
    // --------------------------------------------------

    const validatePhone = () => {

        const phone = form.phone.replace(/\D/g, '')

        if (!/^[6-9]\d{9}$/.test(phone)) {

            setFieldErrors(prev => ({
                ...prev,
                phone: 'Enter a valid 10-digit Indian mobile number.'
            }))

            return false

        }

        return true

    }


    // --------------------------------------------------
    // VALIDATE STEP
    // --------------------------------------------------

    const validateStep = () => {

        const errors = {}

        if (step === 1 && !form.name.trim()) {
            errors.name = 'Please enter your name.'
        }

        if (step === 2 && !validatePhone()) {
            return false
        }

        if (step === 4 && !form.address.trim()) {
            errors.address = 'Please enter your delivery address.'
        }

        setFieldErrors(errors)

        return Object.keys(errors).length === 0

    }


    // --------------------------------------------------
    // SEND OTP
    // --------------------------------------------------

    const sendOTP = async () => {

        if (loading) return

        if (!validatePhone()) return

        const phoneNumber = '+91' + form.phone.replace(/\D/g, '')

        const currentUser = auth.currentUser

        if (!currentUser) {

            setError('Your session has expired. Please sign in again.')

            return

        }

        // Already verified number.

        if (
            currentUser.phoneNumber === phoneNumber &&
            verified &&
            !isEditingPhone
        ) {

            setStep(4)

            return

        }

        setLoading(true)

        setError('')

        try {

            const verifier = await createRecaptcha()

            let result

            if (currentUser.phoneNumber) {

                // Existing account: verify new number before updating.

                const provider = new PhoneAuthProvider(auth)

                result = await provider.verifyPhoneNumber(
                    phoneNumber,
                    verifier
                )

                setVerificationId(result)

                confirmationRef.current = null

            } else {

                // New account: link phone number with Google account.

                result = await linkWithPhoneNumber(
                    currentUser,
                    phoneNumber,
                    verifier
                )

                confirmationRef.current = result

                setVerificationId(null)

            }

            // The OTP request has succeeded.
            // The verifier is no longer needed.

            resetRecaptcha()

            setStep(3)

            setCountdown(30)

            setOtp('')

            setError('')

        } catch (err) {

            resetRecaptcha()

            handleError(err, 'phone')

        } finally {

            setLoading(false)

        }

    }


    // --------------------------------------------------
    // VERIFY OTP
    // --------------------------------------------------

    const verifyOTP = async () => {

        if (loading) return

        if (!/^\d{6}$/.test(otp)) {

            setError('Please enter the 6-digit OTP.')

            return

        }

        setLoading(true)

        setError('')

        try {

            const currentUser = auth.currentUser

            if (!currentUser) {
                throw new Error('Your session has expired. Please sign in again.')
            }

            if (confirmationRef.current) {

                // Linking a new phone number.

                await confirmationRef.current.confirm(otp)

            } else if (verificationId) {

                // Updating an existing phone number.

                const credential = PhoneAuthProvider.credential(
                    verificationId,
                    otp
                )

                await updatePhoneNumber(
                    currentUser,
                    credential
                )

            } else {

                throw new Error('OTP session expired. Please request a new OTP.')

            }

            await auth.currentUser.reload()

            const updatedUser = auth.currentUser

            if (!updatedUser?.phoneNumber) {
                throw new Error('Phone verification could not be completed.')
            }

            setUser(updatedUser)

            setForm(prev => ({
                ...prev,
                phone: updatedUser.phoneNumber.replace('+91', '')
            }))

            setVerified(true)

            setIsEditingPhone(false)

            setVerificationId(null)

            confirmationRef.current = null

            setOtp('')

            setCountdown(0)

            setStep(4)

            resetRecaptcha()

        } catch (err) {

            handleError(err, 'phone')

        } finally {

            setLoading(false)

        }

    }


    // --------------------------------------------------
    // RESEND OTP
    // --------------------------------------------------

    const resendOTP = async () => {

        if (countdown > 0 || loading) return

        setVerificationId(null)

        confirmationRef.current = null

        await sendOTP()

    }


    // --------------------------------------------------
    // NEXT STEP
    // --------------------------------------------------

    const nextStep = () => {

        if (!validateStep()) return

        if (step === 2 && verified && !isEditingPhone) {

            setStep(4)

            return

        }

        setError('')

        setStep(prev => Math.min(prev + 1, 6))

    }


    // --------------------------------------------------
    // PREVIOUS STEP
    // --------------------------------------------------

    const previousStep = () => {

        setError('')

        if (step === 4) {

            setStep(2)

            return

        }

        if (step === 3) {

            setStep(2)

            setOtp('')

            return

        }

        setStep(prev => Math.max(prev - 1, 1))

    }


    // --------------------------------------------------
    // COMPLETE PROFILE
    // --------------------------------------------------

    const completeProfile = async () => {

        if (loading) return

        setError('')

        const errors = {}

        const currentUser = auth.currentUser

        if (!form.name.trim()) {
            errors.name = 'Name is required.'
        }

        if (!form.address.trim()) {
            errors.address = 'Delivery address is required.'
        }

        if (!verified || !currentUser?.phoneNumber) {
            errors.phone = 'Please verify your mobile number.'
        }

        if (
            form.alternatePhone.trim() &&
            !/^[6-9]\d{9}$/.test(form.alternatePhone.replace(/\D/g, ''))
        ) {

            errors.alternatePhone = 'Enter a valid alternate mobile number.'

        }

        setFieldErrors(errors)

        if (Object.keys(errors).length > 0) {

            setError('Please correct the highlighted information.')

            return

        }

        setLoading(true)

        try {

            if (!currentUser) {
                throw new Error('Your session has expired. Please sign in again.')
            }

            const profileRef = doc(
                db,
                'users',
                currentUser.uid,
                'details',
                'profile'
            )

            const profileData = {

                uid: currentUser.uid,

                name: form.name.trim(),

                email: currentUser.email || '',

                phone: currentUser.phoneNumber,

                alternatePhone: form.alternatePhone.trim()
                    ? '+91' + form.alternatePhone.replace(/\D/g, '')
                    : '',

                phoneVerified: true,

                alternatePhoneVerified: false,

                address: form.address.trim(),

                landmark: form.landmark.trim(),

                location: {
                    state: 'Jharkhand',
                    district: 'Hazaribagh',
                    country: 'India',
                    pincode: '825301'
                },

                profileCompleted: true,

                updatedAt: serverTimestamp()

            }

            await setDoc(
                profileRef,
                profileData,
                { merge: true }
            )

            setSuccess(true)

        } catch (err) {

            handleError(err, 'firestore')

        } finally {

            setLoading(false)

        }

    }


    // --------------------------------------------------
    // CLOSE FORM
    // --------------------------------------------------

    const handleClose = async () => {

        if (loading) return

        resetRecaptcha()

        try {

            await signOut(auth)

        } catch (err) {

            console.error('Sign out error:', err)

        }

        onClose?.()

    }


    // --------------------------------------------------
    // SUCCESS CONTINUE
    // --------------------------------------------------

    const handleContinue = () => {

        resetRecaptcha()

        onComplete?.()

    }


    // --------------------------------------------------
    // INPUT CLASSES
    // --------------------------------------------------

    const inputClasses = `
        w-full px-4 py-3
        bg-background
        border border-border
        rounded-xl
        text-text-primary
        placeholder:text-text-muted
        outline-none
        focus:border-primary
        focus:ring-2 focus:ring-primary/10
        transition-all duration-200
    `


    // --------------------------------------------------
    // STEP INFORMATION
    // --------------------------------------------------

    const steps = [
        { title: 'Name', icon: UserRound },
        { title: 'Mobile', icon: Phone },
        { title: 'Verification', icon: ShieldCheck },
        { title: 'Address', icon: MapPin },
        { title: 'Alternate', icon: Phone },
        { title: 'Review', icon: Check }
    ]


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    if (!user) return null


    return (

        <div className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/60 backdrop-blur-sm
            p-3 sm:p-5
        ">

            {/* reCAPTCHA container */}

            <div
                ref={recaptchaContainerRef}
                className="absolute"
            />


            {/* MAIN MODAL */}

            <div className="
                relative
                w-full max-w-xl
                max-h-[92vh]
                overflow-y-auto
                bg-surface
                border border-border
                rounded-3xl
                shadow-2xl
                animate-[profileEnter_0.3s_ease-out]
            ">

                {/* HEADER */}

                <div className="sticky top-0 z-20 bg-surface border-b border-border p-5 sm:p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-text-primary">
                                Complete Your Profile
                            </h2>

                            <p className="text-xs text-text-muted mt-1">
                                Just a few details before you continue.
                            </p>

                        </div>

                        <button
                            onClick={handleClose}
                            disabled={loading}
                            aria-label="Close profile setup"
                            className="
                                p-2 rounded-xl
                                text-text-muted
                                hover:text-danger
                                hover:bg-danger/10
                                transition-all
                            "
                        >
                            <X size={20} />
                        </button>

                    </div>


                    {/* PROGRESS */}

                    {!success && (

                        <div className="mt-6">

                            <div className="flex items-center justify-between">

                                {steps.map((item, index) => {

                                    const Icon = item.icon

                                    const active = step >= index + 1

                                    return (

                                        <React.Fragment key={item.title}>

                                            <div className={`
                                                w-9 h-9 rounded-full
                                                flex items-center justify-center
                                                border
                                                transition-all duration-300
                                                ${active
                                                    ? 'bg-primary border-primary text-background'
                                                    : 'bg-background border-border text-text-muted'
                                                }
                                            `}>
                                                <Icon size={16} />
                                            </div>

                                            {index !== steps.length - 1 && (

                                                <div className={`
                                                    flex-1 h-[2px] mx-1
                                                    ${step > index + 1
                                                        ? 'bg-primary'
                                                        : 'bg-border'
                                                    }
                                                `} />

                                            )}

                                        </React.Fragment>

                                    )

                                })}

                            </div>

                            <p className="text-xs text-text-muted mt-3 text-right">
                                Step {step} of 6
                            </p>

                        </div>

                    )}

                </div>


                {/* BODY */}

                <div className="p-5 sm:p-6">


                    {/* ERROR MESSAGE */}

                    {error && (

                        <div
                            role="alert"
                            className="
                                mb-5 p-3
                                flex items-start gap-2
                                rounded-xl
                                bg-danger/10
                                border border-danger/20
                                text-danger text-sm
                            "
                        >

                            <AlertCircle size={17} className="shrink-0 mt-0.5" />

                            <span>{error}</span>

                        </div>

                    )}


                    {/* STEP 1 */}

                    {!success && step === 1 && (

                        <div className="space-y-5">

                            <div>

                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <UserRound size={24} />
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary">
                                    What should we call you?
                                </h3>

                                <p className="text-sm text-text-muted mt-1">
                                    Your name will appear on your orders.
                                </p>

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className={inputClasses}
                                    maxLength={60}
                                />

                                {fieldErrors.name && (
                                    <p className="text-xs text-danger mt-2">
                                        {fieldErrors.name}
                                    </p>
                                )}

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Email Address
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                                    />

                                    <input
                                        type="email"
                                        value={user.email || ''}
                                        disabled
                                        className={`${inputClasses} pl-11 opacity-70 cursor-not-allowed`}
                                    />

                                </div>

                            </div>

                        </div>

                    )}


                    {/* STEP 2 */}

                    {!success && step === 2 && (

                        <div className="space-y-5">

                            <div>

                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <Phone size={24} />
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary">
                                    Verify your mobile number
                                </h3>

                                <p className="text-sm text-text-muted mt-1">
                                    We will use this number for delivery updates.
                                </p>

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Mobile Number
                                </label>

                                <div className="flex gap-2">

                                    <div className="
                                        px-4 flex items-center
                                        rounded-xl
                                        bg-surface-elevated
                                        border border-border
                                        text-text-secondary
                                        font-medium
                                    ">
                                        +91
                                    </div>

                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={form.phone}
                                        disabled={verified && !isEditingPhone}
                                        onChange={e => {

                                            const value = e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 10)

                                            updateField('phone', value)

                                        }}
                                        placeholder="10-digit mobile number"
                                        className={`
                                            ${inputClasses}
                                            ${verified && !isEditingPhone
                                                ? 'opacity-60 cursor-not-allowed'
                                                : ''
                                            }
                                        `}
                                    />

                                </div>

                                {fieldErrors.phone && (

                                    <p className="text-xs text-danger mt-2">
                                        {fieldErrors.phone}
                                    </p>

                                )}

                            </div>


                            {/* CHANGE NUMBER BUTTON */}

                            {verified && !isEditingPhone && (

                                <button
                                    type="button"
                                    onClick={handleChangePhone}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Change Number
                                </button>

                            )}


                            {isEditingPhone && (

                                <div className="
                                    p-3 rounded-xl
                                    bg-primary/10
                                    text-primary text-xs
                                ">
                                    Enter your new number and verify it using OTP.
                                </div>

                            )}

                        </div>

                    )}


                    {/* STEP 3 */}

                    {!success && step === 3 && (

                        <div className="space-y-5">

                            <div>

                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <ShieldCheck size={24} />
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary">
                                    Verify your number
                                </h3>

                                <p className="text-sm text-text-muted mt-1">
                                    Enter the 6-digit OTP sent to +91 {form.phone}.
                                </p>

                            </div>

                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={otp}
                                onChange={e => {

                                    setOtp(
                                        e.target.value.replace(/\D/g, '').slice(0, 6)
                                    )

                                    setError('')

                                }}
                                placeholder="Enter OTP"
                                className={`
                                    ${inputClasses}
                                    text-center text-2xl
                                    tracking-[0.5em] font-semibold
                                `}
                            />

                            <button
                                type="button"
                                onClick={resendOTP}
                                disabled={countdown > 0 || loading}
                                className="
                                    text-sm text-primary
                                    disabled:text-text-muted
                                "
                            >

                                {countdown > 0
                                    ? `Resend OTP in ${countdown}s`
                                    : 'Resend OTP'
                                }

                            </button>

                        </div>

                    )}


                    {/* STEP 4 */}

                    {!success && step === 4 && (

                        <div className="space-y-5">

                            <div>

                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <MapPin size={24} />
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary">
                                    Where should we deliver?
                                </h3>

                                <p className="text-sm text-text-muted mt-1">
                                    Add your complete delivery address.
                                </p>

                            </div>

                            <div className='text-primary/90 text-sm bg-primary/10 px-3 py-2 rounded-xl'>
                                Delivery is currently limited to Hazaribagh, Jharkhand, India only.
                            </div>


                            <div>

                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Delivery Address
                                </label>

                                <textarea
                                    rows={3}
                                    value={form.address}
                                    onChange={e => updateField('address', e.target.value)}
                                    placeholder="House number, street, area..."
                                    className={`${inputClasses} resize-none`}
                                    maxLength={300}
                                />

                                {fieldErrors.address && (
                                    <p className="text-xs text-danger mt-2">
                                        {fieldErrors.address}
                                    </p>
                                )}

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Landmark (Optional)
                                </label>

                                <input
                                    type="text"
                                    value={form.landmark}
                                    onChange={e => updateField('landmark', e.target.value)}
                                    placeholder="Nearby school, shop, etc."
                                    className={inputClasses}
                                    maxLength={100}
                                />

                            </div>


                            <div className="grid grid-cols-2 gap-3">

                                {[
                                    ['State', 'Jharkhand'],
                                    ['District', 'Hazaribagh'],
                                    ['Country', 'India'],
                                    ['Pincode', '825301']
                                ].map(([label, value]) => (

                                    <div key={label}>

                                        <label className="block text-xs text-text-muted mb-1">
                                            {label}
                                        </label>

                                        <div className="
                                            px-3 py-3
                                            rounded-xl
                                            bg-surface-elevated
                                            border border-border
                                            text-sm text-text-secondary
                                        ">
                                            {value}
                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}


                    {/* STEP 5 */}

                    {!success && step === 5 && (

                        <div className="space-y-5">

                            <div>

                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <Phone size={24} />
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary">
                                    Add an alternate number
                                </h3>

                                <p className="text-sm text-text-muted mt-1">
                                    Optional. This number will not require verification.
                                </p>

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Alternate Mobile Number
                                </label>

                                <div className="flex gap-2">

                                    <div className="
                                        px-4 flex items-center
                                        rounded-xl
                                        bg-surface-elevated
                                        border border-border
                                        text-text-secondary
                                        font-medium
                                    ">
                                        +91
                                    </div>

                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={form.alternatePhone}
                                        onChange={e => {

                                            updateField(
                                                'alternatePhone',
                                                e.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 10)
                                            )

                                        }}
                                        placeholder="Optional number"
                                        className={inputClasses}
                                        maxLength={10}
                                    />

                                </div>

                                {fieldErrors.alternatePhone && (

                                    <p className="text-xs text-danger mt-2">
                                        {fieldErrors.alternatePhone}
                                    </p>

                                )}

                            </div>


                            <div className="p-3 rounded-xl bg-primary/10 text-primary text-xs">
                                You can skip this step and add an alternate number later.
                            </div>

                        </div>

                    )}


                    {/* STEP 6 */}

                    {!success && step === 6 && (

                        <div className="space-y-4">

                            <div>

                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <ShieldCheck size={24} />
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary">
                                    Review your information
                                </h3>

                                <p className="text-sm text-text-muted mt-1">
                                    Make sure everything is correct.
                                </p>

                            </div>


                            {/* PERSONAL INFORMATION */}

                            <div className="p-4 rounded-xl bg-surface-elevated border border-border">

                                <div className="flex items-center justify-between mb-3">

                                    <span className="text-xs text-text-muted">
                                        PERSONAL INFORMATION
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-primary"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                </div>

                                <p className="text-sm font-semibold text-text-primary">
                                    {form.name}
                                </p>

                                <p className="text-xs text-text-muted mt-1">
                                    {user.email}
                                </p>

                            </div>


                            {/* PHONE */}

                            <div className="p-4 rounded-xl bg-surface-elevated border border-border">

                                <div className="flex items-center justify-between mb-3">

                                    <span className="text-xs text-text-muted">
                                        MOBILE NUMBER
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="text-primary"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                </div>

                                <div className="flex items-center justify-between">

                                    <p className="text-sm font-semibold text-text-primary">
                                        {auth.currentUser?.phoneNumber || ''}
                                    </p>

                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                        <Check size={14} />
                                        Verified
                                    </span>

                                </div>

                            </div>


                            {/* ALTERNATE PHONE */}

                            <div className="p-4 rounded-xl bg-surface-elevated border border-border">

                                <div className="flex items-center justify-between mb-3">

                                    <span className="text-xs text-text-muted">
                                        ALTERNATE NUMBER
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(5)}
                                        className="text-primary"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                </div>

                                <p className="text-sm text-text-primary">
                                    {form.alternatePhone
                                        ? '+91 ' + form.alternatePhone
                                        : 'Not provided'
                                    }
                                </p>

                            </div>


                            {/* ADDRESS */}

                            <div className="p-4 rounded-xl bg-surface-elevated border border-border">

                                <div className="flex items-center justify-between mb-3">

                                    <span className="text-xs text-text-muted">
                                        DELIVERY ADDRESS
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setStep(4)}
                                        className="text-primary"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                </div>

                                <p className="text-sm text-text-primary">
                                    {form.address}
                                </p>

                                {form.landmark && (

                                    <p className="text-xs text-text-muted mt-2">
                                        Landmark: {form.landmark}
                                    </p>

                                )}

                                <p className="text-xs text-text-muted mt-2">
                                    Hazaribagh, Jharkhand - 825301, India
                                </p>

                            </div>

                        </div>

                    )}


                    {/* SUCCESS */}

                    {success && (

                        <div className="py-8 text-center">

                            <div className="
                                w-20 h-20
                                mx-auto mb-5
                                rounded-full
                                bg-green-500/10
                                text-green-500
                                flex items-center justify-center
                            ">
                                <Check size={38} />
                            </div>

                            <h3 className="text-2xl font-bold text-text-primary">
                                Profile Completed!
                            </h3>

                            <p className="text-sm text-text-muted mt-2 max-w-sm mx-auto">
                                Your information has been saved successfully. You can now continue shopping.
                            </p>

                        </div>

                    )}

                </div>


                {/* FOOTER */}

                <div className="sticky bottom-0 bg-surface border-t border-border p-5 sm:p-6">

                    {!success ? (

                        <div className="flex items-center gap-3">

                            {step > 1 && (

                                <button
                                    onClick={previousStep}
                                    disabled={loading}
                                    className="
                                        flex items-center justify-center gap-2
                                        px-4 py-3
                                        rounded-xl
                                        border border-border
                                        text-text-secondary
                                        hover:bg-surface-elevated
                                        transition-all
                                    "
                                >
                                    <ArrowLeft size={17} />
                                    Back
                                </button>

                            )}


                            {step === 2 && verified && !isEditingPhone ? (

                                <button
                                    onClick={() => setStep(4)}
                                    className="
                                        flex-1 flex items-center justify-center gap-2
                                        px-4 py-3
                                        rounded-xl
                                        bg-primary text-background
                                        font-semibold
                                        hover:bg-primary-hover
                                        transition-all
                                    "
                                >
                                    Continue
                                    <ArrowRight size={17} />
                                </button>

                            ) : step === 2 ? (

                                <button
                                    onClick={sendOTP}
                                    disabled={loading}
                                    className="
                                        flex-1 flex items-center justify-center gap-2
                                        px-4 py-3
                                        rounded-xl
                                        bg-primary text-background
                                        font-semibold
                                        disabled:opacity-60
                                        transition-all
                                    "
                                >

                                    {loading
                                        ? <LoaderCircle size={18} className="animate-spin" />
                                        : <ShieldCheck size={18} />
                                    }

                                    {loading ? 'Sending OTP...' : 'Send OTP'}

                                </button>

                            ) : step === 3 ? (

                                <button
                                    onClick={verifyOTP}
                                    disabled={loading}
                                    className="
                                        flex-1 flex items-center justify-center gap-2
                                        px-4 py-3
                                        rounded-xl
                                        bg-primary text-background
                                        font-semibold
                                        disabled:opacity-60
                                        transition-all
                                    "
                                >

                                    {loading
                                        ? <LoaderCircle size={18} className="animate-spin" />
                                        : <Check size={18} />
                                    }

                                    {loading ? 'Verifying...' : 'Verify OTP'}

                                </button>

                            ) : step === 6 ? (

                                <button
                                    onClick={completeProfile}
                                    disabled={loading}
                                    className="
                                        flex-1 flex items-center justify-center gap-2
                                        px-4 py-3
                                        rounded-xl
                                        bg-primary text-background
                                        font-semibold
                                        disabled:opacity-60
                                        transition-all
                                    "
                                >

                                    {loading
                                        ? <LoaderCircle size={18} className="animate-spin" />
                                        : <Check size={18} />
                                    }

                                    {loading ? 'Saving Profile...' : 'Complete Profile'}

                                </button>

                            ) : (

                                <button
                                    onClick={nextStep}
                                    disabled={loading}
                                    className="
                                        flex-1 flex items-center justify-center gap-2
                                        px-4 py-3
                                        rounded-xl
                                        bg-primary text-background
                                        font-semibold
                                        hover:bg-primary-hover
                                        transition-all
                                    "
                                >
                                    Continue
                                    <ArrowRight size={17} />
                                </button>

                            )}

                        </div>

                    ) : (

                        <button
                            onClick={handleContinue}
                            className="
                                w-full flex items-center justify-center gap-2
                                px-4 py-3
                                rounded-xl
                                bg-primary text-background
                                font-semibold
                                hover:bg-primary-hover
                                transition-all
                            "
                        >
                            Continue to BR Utensils
                            <ArrowRight size={18} />
                        </button>

                    )}

                </div>

            </div>


            {/* CHANGE NUMBER CONFIRMATION */}

            {showChangeConfirmation && (

                <div className="
                    fixed inset-0 z-[120]
                    flex items-center justify-center
                    bg-black/60 backdrop-blur-sm
                    p-4
                ">

                    <div className="
                        w-full max-w-sm
                        bg-surface
                        border border-border
                        rounded-2xl
                        shadow-2xl
                        p-6
                        animate-[profileEnter_0.2s_ease-out]
                    ">

                        <div className="
                            w-12 h-12
                            flex items-center justify-center
                            rounded-xl
                            bg-primary/10
                            text-primary
                            mb-4
                        ">
                            <AlertTriangle size={24} />
                        </div>

                        <h3 className="text-lg font-bold text-text-primary">
                            Change Mobile Number?
                        </h3>

                        <p className="text-sm text-text-muted mt-2 leading-relaxed">
                            Are you sure you want to change your verified mobile number?
                            You will need to verify the new number using an OTP.
                        </p>

                        <div className="flex gap-3 mt-6">

                            <button
                                type="button"
                                onClick={cancelChangePhone}
                                className="
                                    flex-1 py-3
                                    rounded-xl
                                    border border-border
                                    text-text-secondary
                                    hover:bg-surface-elevated
                                    transition-all
                                "
                            >
                                No
                            </button>

                            <button
                                type="button"
                                onClick={confirmChangePhone}
                                className="
                                    flex-1 py-3
                                    rounded-xl
                                    bg-primary
                                    text-background
                                    font-semibold
                                    hover:bg-primary-hover
                                    transition-all
                                "
                            >
                                Yes, Change
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* RECAPTCHA RELOAD COUNTDOWN */}

            {reloadCountdown !== null && (

                <div className="
                    fixed inset-0 z-[150]
                    flex items-center justify-center
                    bg-black/80 backdrop-blur-md
                    p-4
                ">

                    <div className="
                        w-full max-w-xs
                        bg-surface
                        border border-border
                        rounded-2xl
                        p-7
                        text-center
                        shadow-2xl
                    ">

                        <div className="
                            w-14 h-14
                            mx-auto mb-4
                            flex items-center justify-center
                            rounded-full
                            bg-primary/10
                            text-primary
                        ">
                            <LoaderCircle size={28} className="animate-spin" />
                        </div>

                        <h3 className="text-lg font-bold text-text-primary">
                            Refreshing Security
                        </h3>

                        <p className="text-sm text-text-muted mt-2">
                            A verification issue occurred. The page will reload automatically.
                        </p>

                        <div className="text-4xl font-bold text-primary mt-5">
                            {reloadCountdown}
                        </div>

                    </div>

                </div>

            )}


            {/* ANIMATION */}

            <style>{`

                @keyframes profileEnter {

                    from {
                        opacity: 0;
                        transform: translateY(15px) scale(0.98);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }

                }

            `}</style>

        </div>

    )

}

export default ProfileSetupForm