import React, { useContext, useEffect, useState, useRef } from 'react'
import { ThemeContextProvider } from '../../Context/ThemeContext'
import { Moon, Sun, Bot } from 'lucide-react'

const ThemeSwitcher = () => {

    const context = useContext(ThemeContextProvider)
    const theme = context[0]
    const setTheme = context[1]

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Auto Theme
    const AutoTheme = () => {
        const deviceTheme = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches

        setTheme(deviceTheme ? "Dark" : "Light")
    }

    // Load saved theme
    useEffect(() => {
        const savedTheme = localStorage.getItem("Theme")

        if (!savedTheme || savedTheme === "Auto") {
            AutoTheme()
        } else {
            setTheme(savedTheme)
        }
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {

        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick)
        }

    }, [])

    // Change Theme
    const changeTheme = (selectedTheme) => {

        localStorage.setItem("Theme", selectedTheme)

        if (selectedTheme === "Auto") {
            AutoTheme()
        } else {
            setTheme(selectedTheme)
        }

        setIsOpen(false)
    }

    return (

        <div className='h-fit w-fit bg-background rounded-md text-text-primary'>

            <div ref={dropdownRef} className='relative w-fit'>

                {/* Theme Toggle Button */}

                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    className='p-2 rounded-md bg-surface hover:bg-surface-elevated transition-colors'
                >
                    {theme === "Light" ? <Sun /> : <Moon />}
                </button>


                {/* Theme Dropdown */}

                <div
                    className={`
                        absolute -top-[180px] mt-2 right-0
                        bg-surface-elevated
                        flex flex-col gap-2 p-3
                        w-36 rounded-md shadow-lg
                        origin-top
                        border-border
                        border-2
                        transition-all duration-300 ease-in-out
                        ${isOpen
                            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
                        }
                    `}
                >

                    <button
                        onClick={() => changeTheme("Dark")}
                        className='flex items-center gap-2 p-2 rounded-md hover:bg-background transition-colors'
                    >
                        <Moon size={18} />
                        Dark
                    </button>

                    <button
                        onClick={() => changeTheme("Light")}
                        className='flex items-center gap-2 p-2 rounded-md hover:bg-background transition-colors'
                    >
                        <Sun size={18} />
                        Light
                    </button>

                    <button
                        onClick={() => changeTheme("Auto")}
                        className='flex items-center gap-2 p-2 rounded-md hover:bg-background transition-colors'
                    >
                        <Bot size={18} />
                        Auto
                    </button>

                </div>

            </div>

        </div>
    )
}

export default ThemeSwitcher