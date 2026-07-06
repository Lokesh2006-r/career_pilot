import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  colored?: boolean;
}

export function CareerPilotIcon({ size = 48, colored = true, className, ...props }: LogoProps) {
  // Brand color is context-aware CSS variable (black in light mode, white in dark mode)
  const color = colored ? "var(--brand-color)" : "currentColor";
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill={color} />
      
      {/* Rocket Group rotated to point top-right */}
      <g transform="rotate(45 50 50)">
        {/* Left Fin */}
        <path d="M 35 45 Q 15 55, 20 70 L 35 65 Z" fill="var(--background)" />
        
        {/* Right Fin */}
        <path d="M 65 45 Q 85 55, 80 70 L 65 65 Z" fill="var(--background)" />
        
        {/* Rocket Body */}
        <path d="M 50 10 C 70 25, 65 65, 65 65 L 35 65 C 35 65, 30 25, 50 10 Z" fill="var(--background)" />
        
        {/* Nose Cone Separator */}
        <path d="M 37 28 Q 50 35, 63 28" stroke={color} strokeWidth="3" fill="none" />
        
        {/* Window */}
        <circle cx="50" cy="42" r="7" fill={color} />
        <circle cx="50" cy="42" r="3" fill="var(--background)" />
        
        {/* Nozzle */}
        <path d="M 40 65 L 38 72 L 62 72 L 60 65 Z" fill="var(--background)" />
        
        {/* Exhaust Lines */}
        <line x1="40" y1="78" x2="40" y2="92" stroke="var(--background)" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="76" x2="50" y2="96" stroke="var(--background)" strokeWidth="4" strokeLinecap="round" />
        <line x1="60" y1="78" x2="60" y2="92" stroke="var(--background)" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function CareerPilotLogo({ 
  size = 38, 
  colored = true, 
  showText = true, 
  textColorClass = "text-zinc-900 dark:text-white" 
}: { 
  size?: number; 
  colored?: boolean; 
  showText?: boolean;
  textColorClass?: string;
}) {
  const brandColor = "var(--brand-color)";
  return (
    <div className="flex items-center gap-2.5 select-none shrink-0">
      <CareerPilotIcon size={size} colored={colored} />
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span 
            className={`text-base font-black tracking-wide uppercase font-sans ${textColorClass}`}
            style={colored ? { color: brandColor } : undefined}
          >
            Career Pilot
          </span>
          <span className="text-[7.5px] font-black tracking-[0.25em] text-zinc-450 dark:text-zinc-500 uppercase mt-0.5">
            Code • Learn • Succeed
          </span>
        </div>
      )}
    </div>
  );
}
