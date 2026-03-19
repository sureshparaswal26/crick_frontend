'use client';

import { useState } from 'react';

/** Dummy logo: cricket ball icon in a circle */
function DummyLogo({ sizeClass }: { sizeClass: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 ${sizeClass}`}
      aria-hidden
    >
      <svg
        className="h-[55%] w-[55%]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeWidth="1" />
        <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeWidth="1" />
      </svg>
    </span>
  );
}

type TeamLogoProps = {
  src?: string | null;
  name?: string;
  shortname?: string;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8' };

export function TeamLogo({ src, name, shortname, size = 'sm', className = '' }: TeamLogoProps) {
  const [errored, setErrored] = useState(false);
  const sizeClass = sizeMap[size];
  const showImg = src && !errored;

  if (showImg) {
    return (
      <img
        src={src}
        alt=""
        className={`rounded object-contain ${sizeClass} ${className}`}
        onError={() => setErrored(true)}
      />
    );
  }

  return <DummyLogo sizeClass={`${sizeClass} ${className}`} />;
}
