import type { CSSProperties } from "react";

interface AvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  size?: number;
  /** When set (e.g. 28 for patient header), initials use this font size and tp-heading-05; otherwise scale by size. */
  initialsFontSize?: number;
}

/** MyAlign patient file — Figma 2079:14328: highlight-blue surface, teal initials (#005780); image when available */
const AVATAR_SURFACE: CSSProperties = {
  boxSizing: "border-box",
  backgroundColor: "var(--color-background-highlight-blue)",
  border: "1px solid var(--color-border-highlight-blue)",
};

export default function Avatar({ firstName, lastName, imageUrl, size = 36, initialsFontSize }: AvatarProps) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const useHeaderStyle = initialsFontSize != null;
  const initialsSize = useHeaderStyle ? initialsFontSize : size === 36 ? 16 : size * 0.42;
  const initialsClassName = useHeaderStyle
    ? "tp-heading-05 text-[var(--color-text-on-highlight-blue)]"
    : "tp-body-03 font-medium text-[var(--color-text-on-highlight-blue)]";

  if (imageUrl) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          ...AVATAR_SURFACE,
        }}
      >
        <img
          src={imageUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            const parent = el.parentElement;
            if (!parent) return;
            const fallback = document.createElement("span");
            fallback.className = `flex items-center justify-center w-full h-full ${initialsClassName}`;
            fallback.style.fontSize = `${initialsSize}px`;
            fallback.textContent = initials;
            parent.removeChild(el);
            parent.appendChild(fallback);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${initialsClassName}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        ...AVATAR_SURFACE,
        fontSize: initialsSize,
        ...(useHeaderStyle ? {} : { fontWeight: 500 }),
      }}
    >
      {initials}
    </div>
  );
}
