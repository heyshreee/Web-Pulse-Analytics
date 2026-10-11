import React from 'react';

/**
 * WebPulse Signature Global Loader
 * Premium telemetry pulse animation with ambient glow, concentric radar rings,
 * high-tech shimmer progress bar, and adaptive dark/light glassmorphic surface.
 */
export default function GlobalLoader({
  fullScreen = true,
  label = 'Streaming real-time telemetry…',
  subLabel = 'Connecting to WebPulse engine',
  className = ''
}) {
  if (!fullScreen) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 gap-4 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="relative flex items-center justify-center w-12 h-12">
          {/* Outer radar pulse ring */}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60" />
          <span className="absolute -inset-2 rounded-full border border-primary/30 animate-pulse" />
          
          {/* Core spinning/glowing icon badge */}
          <div className="relative w-10 h-10 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center text-primary">
            <svg
              className="w-5 h-5 animate-pulse text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        {label && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-muted-foreground font-mono">
              {label}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl animate-fade-in ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Background ambient radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center p-8 max-w-sm w-full mx-4 rounded-2xl bg-card/60 border border-border/80 shadow-2xl shadow-primary/5 backdrop-blur-2xl text-center">
        
        {/* Pulsating Radar & WebPulse Emblem */}
        <div className="relative flex items-center justify-center w-20 h-20 mb-6">
          {/* Sonar rings */}
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping duration-1000 opacity-70" />
          <span className="absolute -inset-3 rounded-full border border-primary/20 animate-pulse duration-700" />
          <span className="absolute -inset-6 rounded-full border border-primary/10" />

          {/* Central Logo Badge */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center ring-4 ring-card">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        {/* Brand name & live badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-display font-bold text-foreground text-lg tracking-tight">
            WebPulse
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            LIVE
          </span>
        </div>

        {/* Dynamic Status Text */}
        <p className="text-xs text-muted-foreground font-medium mb-5">
          {label}
        </p>

        {/* Shimmer Telemetry Progress Bar */}
        <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden relative mb-2">
          <div className="absolute top-0 bottom-0 left-0 w-24 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 animate-[shimmer_1.5s_infinite_linear]" />
        </div>

        {subLabel && (
          <span className="text-[11px] text-muted-foreground/70 font-mono">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}
