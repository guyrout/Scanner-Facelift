import {
  BackspaceIcon,
  ReturnIcon,
  ShiftIcon,
  KeyboardIcon,
  CloseIcon,
  ChevronLeftSmallIcon,
  ChevronRightSmallIcon,
  EmojiIcon,
} from "./Icons";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}

const ROW1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const ROW2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l", "'"];
const ROW3 = ["z", "x", "c", "v", "b", "n", "m", ",", ".", "?"];

const KEY_H = "h-[64px] min-h-[64px]";
const KEY_BASE =
  "tp-heading-03 rounded-[4px] bg-key-bg text-on-color shadow-[var(--shadow-card)] flex items-center justify-center cursor-pointer font-normal active:brightness-125 transition-ui transition-press active-press border-0 select-none";

function Key({
  children,
  onClick,
  width,
  flex,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  width?: number;
  flex?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      className={`${KEY_H} ${KEY_BASE} ${flex ? "min-w-0 flex-1" : ""}`}
      style={flex ? undefined : { width, minWidth: width }}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      type="button"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default function VirtualKeyboard({
  onKeyPress,
  onBackspace,
  onClose,
}: VirtualKeyboardProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-keyboard-bg z-50 animate-keyboard-enter">
      <div className="w-full max-w-[904px] flex flex-col">
        {/* Toolbar: keyboard dock + close aligned right */}
        <div className="flex items-center justify-end h-[44px] shrink-0">
          <button
            type="button"
            className="flex items-center justify-center size-[44px] rounded cursor-pointer border-0 bg-transparent touch-target-min"
            aria-label="Keyboard options"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            <KeyboardIcon size={21} color="var(--color-icon-on-color-primary)" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center size-[44px] rounded cursor-pointer border-0 bg-transparent touch-target-min"
            aria-label="Close keyboard"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            <CloseIcon size={24} color="var(--color-icon-on-color-primary)" />
          </button>
        </div>

        {/* Key rows */}
        <div className="flex flex-col items-stretch gap-2 pb-4">
          {/* Row 1: q-p + wide backspace */}
          <div className="flex items-center gap-2">
            {ROW1.map((key) => (
              <Key key={key} onClick={() => onKeyPress(key)} width={68}>
                {key}
              </Key>
            ))}
            <Key onClick={onBackspace} width={144} ariaLabel="Backspace">
              <BackspaceIcon size={26} color="var(--color-icon-on-color-primary)" />
            </Key>
          </div>

          {/* Row 2: offset 20px, a-' + wide return */}
          <div className="flex items-center gap-2" style={{ paddingLeft: 20 }}>
            {ROW2.map((key) => (
              <Key key={key} onClick={() => onKeyPress(key)} width={68}>
                {key}
              </Key>
            ))}
            <Key onClick={onClose} width={124} ariaLabel="Close keyboard">
              <ReturnIcon size={22} color="var(--color-icon-on-color-primary)" />
            </Key>
          </div>

          {/* Row 3: shift + z-? + shift */}
          <div className="flex items-center gap-2">
            <Key onClick={() => {}} width={68}>
              <ShiftIcon size={20} color="var(--color-icon-on-color-primary)" />
            </Key>
            {ROW3.map((key) => (
              <Key key={key} onClick={() => onKeyPress(key)} width={68}>
                {key}
              </Key>
            ))}
            <Key onClick={() => {}} width={68}>
              <ShiftIcon size={20} color="var(--color-icon-on-color-primary)" />
            </Key>
          </div>

          {/* Row 4: &123, Ctrl, emoji, spacebar, <, >, keyboard */}
          <div className="flex items-center gap-2">
            <Key onClick={() => {}} width={68}>
              <span className="tp-body-03">&amp;123</span>
            </Key>
            <Key onClick={() => {}} width={68}>
              <span className="tp-body-03">Ctrl</span>
            </Key>
            <Key onClick={() => {}} width={68}>
              <EmojiIcon size={22} color="var(--color-icon-on-color-primary)" />
            </Key>
            <Key onClick={() => onKeyPress(" ")} flex ariaLabel="Space">
              <span />
            </Key>
            <Key onClick={() => {}} width={68}>
              <ChevronLeftSmallIcon size={20} color="var(--color-icon-on-color-primary)" />
            </Key>
            <Key onClick={() => {}} width={68}>
              <ChevronRightSmallIcon size={20} color="var(--color-icon-on-color-primary)" />
            </Key>
            <Key onClick={() => {}} width={68}>
              <KeyboardIcon size={21} color="var(--color-icon-on-color-primary)" />
            </Key>
          </div>
        </div>
      </div>
    </div>
  );
}
