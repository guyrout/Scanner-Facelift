interface AvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  size?: number;
  /** When set (e.g. 28 for patient header), initials use this font size and tp-heading-05; otherwise scale by size. */
  initialsFontSize?: number;
}

/** Figma: initials in a light gray circle; profile image when available (Align light mode) */
export default function Avatar({ firstName, lastName, imageUrl, size = 36, initialsFontSize }: AvatarProps) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const useHeaderStyle = initialsFontSize != null;
  const initialsSize = useHeaderStyle ? initialsFontSize : size * 0.42;
  const initialsClassName = useHeaderStyle
    ? "tp-heading-05 text-text-primary"
    : "tp-body-03 font-medium text-text-primary";

  if (imageUrl) {
    return (
      <div
        className="rounded-full overflow-hidden shrink-0"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          backgroundColor: "var(--color-background-accent)",
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
        backgroundColor: "var(--color-background-accent)",
        fontSize: initialsSize,
      }}
    >
      {initials}
    </div>
  );
}
