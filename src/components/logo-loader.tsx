import logo from "@/assets/aroma-academy-logo.png";

/** Logo with a rotating ring line around it — used instead of plain spinners. */
export function LogoLoader({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size + 28, height: size + 28 }} role="status" aria-label="Loading">
      <svg className="absolute inset-0 size-full animate-spin [animation-duration:1.4s]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="90 200" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="40 250" strokeDashoffset="-150" />
      </svg>
      <img src={logo} alt="" width={size} height={size} className="object-contain p-1.5" style={{ width: size, height: size }} />
    </div>
  );
}
