interface DoctorSiteLoginModalProps {
  onClose: () => void;
}

export default function DoctorSiteLoginModal({ onClose }: DoctorSiteLoginModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Invisalign Doctor Site login"
    >
      {/* Backdrop — click to close */}
      <div
        className="absolute inset-0 animate-modal-backdrop-enter"
        style={{ backgroundColor: "var(--color-background-overlay)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Show the design PNG */}
      <div
        className="relative rounded-xl overflow-hidden shadow-xl animate-modal-content-enter"
        style={{ width: 931, height: 660 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/doctor-site-login-bg.png"
          alt="Invisalign Doctor Site login"
          className="block w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
