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
      {/* Rotated Diamond Outer Border */}
      <polygon 
        points="50,12 88,50 50,88 12,50" 
        stroke={color} 
        strokeWidth="4" 
        strokeLinejoin="round" 
        fill="none" 
      />
      
      {/* Bar Chart inside Diamond */}
      <rect x="42" y="58" width="6" height="12" rx="1.5" fill={color} />
      <rect x="52" y="44" width="6" height="26" rx="1.5" fill={color} />
      <rect x="62" y="30" width="6" height="40" rx="1.5" fill={color} />
      
      {/* Magnifying Glass Lens */}
      <circle 
        cx="44" 
        cy="48" 
        r="13" 
        stroke={color} 
        strokeWidth="5" 
        fill="none" 
      />
      
      {/* Magnifying Glass Handle */}
      <line 
        x1="35" 
        y1="57" 
        x2="22" 
        y2="70" 
        stroke={color} 
        strokeWidth="7.5" 
        strokeLinecap="round" 
      />
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
