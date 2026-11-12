import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="w-full bg-surface border-t border-border mt-20" theme="Dark">

            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">

                {/* Footer Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">

                        <Link to="/">
                            <img
                                src="/logo.jpg"
                                alt="BR Utensils"
                                className="w-20 object-contain"
                            />
                        </Link>

                        <p className="text-sm text-text-secondary mt-5 leading-relaxed">
                            Your trusted destination for quality kitchenware.
                        </p>

                        {/* Social Links */}
                        {/* Social Links */}
                        <div className="flex items-center gap-4 mt-6">

                            {/* Facebook */}
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="text-text-secondary hover:text-primary transition-colors"
                                target='_blank'
                            >
                                <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
                                    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.2v2.3H7.6V13h2.7v8h3.2z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="text-text-secondary hover:text-primary transition-colors"
                                target='_blank'
                            >
                                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="3" y="3" width="18" height="18" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </a>

                            {/* YouTube */}
                            <a
                                href="#"
                                aria-label="YouTube"
                                className="text-text-secondary hover:text-primary transition-colors"
                                target='_blank'
                            >
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                                </svg>
                            </a>

                        </div>
                    </div>


                    {/* Quick Links */}
                    <div>
                        <h3 className="text-text-primary font-semibold mb-5">
                            Quick Links
                        </h3>

                        <ul className="space-y-3 text-sm text-text-secondary">

                            <li>
                                <Link to="/" className="hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link to="/products" className="hover:text-primary transition-colors">
                                    Products
                                </Link>
                            </li>

                            <li>
                                <Link to="/about" className="hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Link to="/contact" className="hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>

                        </ul>
                    </div>


                    {/* Support */}
                    <div>
                        <h3 className="text-text-primary font-semibold mb-5">
                            Support
                        </h3>

                        <ul className="space-y-3 text-sm text-text-secondary">

                            <li>
                                <Link to="/orders" className="hover:text-primary transition-colors">
                                    Your Orders
                                </Link>
                            </li>

                            <li>
                                <Link to="/profile" className="hover:text-primary transition-colors">
                                    Your Profile
                                </Link>
                            </li>

                             <li>
                                <Link to="/cart" className="hover:text-primary transition-colors">
                                    Your Cart
                                </Link>
                            </li>

                            <li>
                                <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>


                           

                        </ul>
                    </div>


                    {/* Information */}
                    <div>
                        <h3 className="text-text-primary font-semibold mb-5">
                            Information
                        </h3>

                        <ul className="space-y-3 text-sm text-text-secondary">

                            <li>
                                <Link to="/about" className="hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Link to="/contact" className="hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>

                            <li>
                                <Link to="/terms" className="hover:text-primary transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>

                             <li>
                                <Link to="/faqs" className="hover:text-primary transition-colors">
                                    FAQs
                                </Link>
                            </li>

                        </ul>
                    </div>

                </div>


                {/* Copyright */}
                <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-text-secondary">

                    <p>
                        © {new Date().getFullYear()} BR Utensils
                    </p>

                    <p>
                        All Rights Reserved
                    </p>

                </div>

            </div>
        </footer>
    )
}

export default Footer