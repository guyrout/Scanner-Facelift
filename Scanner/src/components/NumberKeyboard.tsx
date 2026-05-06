import { CloseIcon } from "./Icons";
import keyboardNextIcon from "../assets/keyboard-next.svg";
import keyboardDeleteIcon from "../assets/keyboard-delete.svg";

interface NumberKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClose: () => void;
  /** `fixed` pins the keyboard to the viewport bottom (for scrollable pages); default `absolute` (bottom of positioned parent). */
  position?: "absolute" | "fixed";
}

const KEY_BASE =
  "bg-[rgba(0,0,0,0.63)] rounded-[8px] flex items-center justify-center cursor-pointer border-0 select-none active:brightness-125 transition-ui transition-press active-press";

const NUMBER_KEY_CLASS = `${KEY_BASE} px-2 py-5 min-h-[84px]`;
const ACTION_KEY_CLASS = `${KEY_BASE} min-h-[84px]`;

function NumberKey({ number, onClick }: { number: string; onClick: () => void }) {
  return (
    <button
      className={NUMBER_KEY_CLASS}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      type="button"
      aria-label={number}
    >
      <span
        className="text-white text-center w-[88px]"
        style={{
          fontFamily: "var(--font-family/roboto, 'Roboto', sans-serif)",
          fontWeight: 500,
          fontSize: "36px",
          lineHeight: "44px",
          fontVariationSettings: "'wdth' 100",
        }}
      >
        {number}
      </span>
    </button>
  );
}

function ActionKey({
  onClick,
  icon,
  ariaLabel,
  className,
}: {
  onClick: () => void;
  icon: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      className={`${ACTION_KEY_CLASS} ${className || ""}`}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      type="button"
      aria-label={ariaLabel}
    >
      <img src={icon} alt="" className="pointer-events-none block shrink-0" style={{ width: 32, height: 32 }} />
    </button>
  );
}

export default function NumberKeyboard({ onKeyPress, onBackspace, onClose, position = "absolute" }: NumberKeyboardProps) {
  const posClass = position === "fixed" ? "fixed bottom-0 z-[10050]" : "absolute bottom-0 z-50";
  
  return (
    <div
      id="scanner-number-keyboard"
      className={`left-0 right-0 flex justify-center bg-keyboard-bg animate-keyboard-enter ${posClass}`}
      style={{ padding: "8px" }}
    >
      <div className="w-full flex items-start justify-between">
        {/* Left side - empty with opacity 0 for spacing */}
        <div className="flex items-center justify-end shrink-0 opacity-0" style={{ width: 60, height: 64 }}>
          <button
            type="button"
            className="flex items-center justify-center rounded"
            style={{ width: 64, height: 64, padding: "22px 24px" }}
            aria-label="Placeholder"
          >
            <CloseIcon size={32} color="white" />
          </button>
        </div>

        {/* Center - Number keypad */}
        <div className="flex items-center justify-center shrink-0">
          <div className="flex flex-col items-start shrink-0" style={{ gap: 8 }}>
            {/* Row 1: 1-3 */}
            <div className="flex items-center w-full shrink-0" style={{ gap: 8 }}>
              <NumberKey number="1" onClick={() => onKeyPress("1")} />
              <NumberKey number="2" onClick={() => onKeyPress("2")} />
              <NumberKey number="3" onClick={() => onKeyPress("3")} />
            </div>

            {/* Row 2: 4-6 */}
            <div className="flex items-center w-full shrink-0" style={{ gap: 8 }}>
              <NumberKey number="4" onClick={() => onKeyPress("4")} />
              <NumberKey number="5" onClick={() => onKeyPress("5")} />
              <NumberKey number="6" onClick={() => onKeyPress("6")} />
            </div>

            {/* Row 3: 7-9 */}
            <div className="flex items-center w-full shrink-0" style={{ gap: 8 }}>
              <NumberKey number="7" onClick={() => onKeyPress("7")} />
              <NumberKey number="8" onClick={() => onKeyPress("8")} />
              <NumberKey number="9" onClick={() => onKeyPress("9")} />
            </div>

            {/* Row 4: Enter / 0 / Delete */}
            <div className="flex items-center w-full shrink-0" style={{ gap: 8 }}>
              <ActionKey
                onClick={onClose}
                icon={keyboardNextIcon}
                ariaLabel="Close keyboard"
                className="flex-1 min-w-0"
              />
              <NumberKey number="0" onClick={() => onKeyPress("0")} />
              <ActionKey
                onClick={onBackspace}
                icon={keyboardDeleteIcon}
                ariaLabel="Backspace"
                className="flex-1 min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Right side - Close button */}
        <div className="flex items-center justify-end shrink-0" style={{ width: 60, height: 60 }}>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded cursor-pointer border-0 bg-transparent"
            style={{ width: 60, height: 60, padding: "22px 24px" }}
            aria-label="Close keyboard"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            <CloseIcon size={32} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
