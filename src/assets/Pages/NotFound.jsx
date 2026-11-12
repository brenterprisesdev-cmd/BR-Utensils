import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

const NotFound = () => {

  return (
    <main className="relative h-fit min-h-screen overflow-hidden bg-background flex items-center justify-center px-5 py-16">

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-[100px] -top-32 -left-32 animate-pulse" />

        <div className="absolute w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -bottom-40 -right-32 animate-pulse [animation-delay:1s]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px'
          }}
        />

      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl text-center">

        {/* Status */}
        <div className="animate-[fadeUp_0.7s_ease-out_both] inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">

          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
            Error 404 · Page Not Found
          </span>

        </div>

        {/* 404 Typography */}
        <div className="relative select-none animate-[scaleIn_0.9s_cubic-bezier(0.16,1,0.3,1)_both]">

          <h1
            className="
              text-[clamp(130px,30vw,260px)]
              leading-[0.85]
              font-black tracking-[-0.09em]
              bg-gradient-to-b from-primary via-primary-hover to-secondary
              bg-clip-text text-transparent
              drop-shadow-[0_15px_35px_rgba(212,175,55,0.12)]
            "
          >
            404
          </h1>

          {/* Decorative Orb */}
          <div className="absolute top-[15%] left-[18%] w-3 h-3 rounded-full bg-primary shadow-[0_0_20px_5px_rgba(212,175,55,0.5)] animate-[float_4s_ease-in-out_infinite]" />

          <div className="absolute bottom-[10%] right-[15%] w-4 h-4 rounded-full border border-primary/70 animate-[float_5s_ease-in-out_infinite_reverse]" />

        </div>

        {/* Text Content */}
        <div className="mt-10 animate-[fadeUp_0.8s_0.2s_ease-out_both]">

          <h2 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Looks like you're lost.
          </h2>

          <p className="mt-4 max-w-md mx-auto text-sm sm:text-base leading-relaxed text-text-secondary">
            The page you're looking for doesn't exist, has been moved,
            or might have been removed.
          </p>

        </div>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 animate-[fadeUp_0.8s_0.35s_ease-out_both]">

          {/* Home Button */}
          <Link
            to="/"
            className="
              group flex items-center justify-center gap-2.5
              w-full sm:w-auto
              px-7 py-3.5 rounded-xl
              bg-primary text-background
              font-semibold text-sm
              shadow-[0_5px_25px_rgba(212,175,55,0.15)]
              hover:bg-primary-hover
              hover:shadow-[0_8px_35px_rgba(212,175,55,0.3)]
              hover:-translate-y-1
              active:scale-95
              transition-all duration-300
            "
          >

            <Home size={18} />

            Back to Home

          </Link>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            className="
              group flex items-center justify-center gap-2
              w-full sm:w-auto
              px-7 py-3.5 rounded-xl
              border border-border
              bg-surface text-text-secondary
              hover:bg-surface-elevated
              hover:text-primary hover:border-primary/40
              hover:-translate-y-1
              active:scale-95
              transition-all duration-300
            "
          >

            <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-1" />

            Go Back

          </button>

        </div>

      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-18px) translateX(8px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

    </main>
  )
}

export default NotFound