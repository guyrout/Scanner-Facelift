import { useState, useRef } from "react";
import VirtualKeyboard from "./VirtualKeyboard";
import BatteryModal from "./BatteryModal";
import { HelpIcon, BatteryIcon, SettingsIcon } from "./Icons";

const ICON_FILL = "rgba(0,0,0,0.445)";

/** Visibility off icon — from Figma / Visibility off.svg */
function VisibilityOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3.92968 16.8825L5.00218 15.8175C3.82784 14.7631 2.90516 13.4585 2.30218 12C3.82468 8.1975 8.02468 5.25 11.9997 5.25C13.0226 5.2635 14.0363 5.44596 14.9997 5.79L16.1622 4.62C14.8442 4.06299 13.4304 3.76751 11.9997 3.75C9.55507 3.84193 7.19097 4.64817 5.19958 6.06906C3.20819 7.48996 1.6768 9.46324 0.794681 11.745C0.735106 11.9098 0.735106 12.0902 0.794681 12.255C1.46087 14.0228 2.535 15.6083 3.92968 16.8825Z" fill={ICON_FILL} fillOpacity={1} />
      <path d="M8.99968 11.7975C9.05184 11.0788 9.36095 10.4029 9.87049 9.89331C10.38 9.38377 11.056 9.07466 11.7747 9.0225L13.1322 7.6575C12.3715 7.45721 11.5716 7.45981 10.8122 7.66505C10.0529 7.87028 9.36059 8.27098 8.80438 8.8272C8.24816 9.38341 7.84746 10.0757 7.64223 10.8351C7.43699 11.5944 7.43439 12.3943 7.63468 13.155L8.99968 11.7975Z" fill={ICON_FILL} fillOpacity={1} />
      <path d="M23.2047 11.745C22.3447 9.5049 20.8482 7.56527 18.8997 6.165L22.4997 2.5575L21.4422 1.5L1.49968 21.4425L2.55718 22.5L6.38218 18.675C8.08759 19.6755 10.0227 20.2181 11.9997 20.25C14.4443 20.1581 16.8084 19.3518 18.7998 17.9309C20.7912 16.51 22.3226 14.5368 23.2047 12.255C23.2643 12.0902 23.2643 11.9098 23.2047 11.745ZM14.9997 12C14.9965 12.5251 14.8556 13.0401 14.591 13.4937C14.3264 13.9472 13.9474 14.3234 13.4919 14.5845C13.0364 14.8457 12.5203 14.9827 11.9952 14.982C11.4701 14.9812 10.9544 14.8426 10.4997 14.58L14.5797 10.5C14.8493 10.9543 14.9942 11.4717 14.9997 12ZM11.9997 18.75C10.4262 18.7225 8.8826 18.316 7.49968 17.565L9.40468 15.66C10.2712 16.2612 11.3213 16.539 12.3718 16.4449C13.4222 16.3507 14.4062 15.8906 15.152 15.1448C15.8977 14.399 16.3579 13.415 16.452 12.3646C16.5462 11.3142 16.2684 10.264 15.6672 9.3975L17.8197 7.245C19.5406 8.42624 20.8864 10.0766 21.6972 12C20.1747 15.8025 15.9747 18.75 11.9997 18.75Z" fill={ICON_FILL} fillOpacity={1} />
    </svg>
  );
}

/** Visibility on icon — from Figma / Visibility On.svg */
function VisibilityOnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M23.2047 11.745C22.3226 9.46324 20.7912 7.48996 18.7998 6.06906C16.8084 4.64817 14.4443 3.84193 11.9997 3.75C9.55507 3.84193 7.19097 4.64817 5.19958 6.06906C3.20819 7.48996 1.6768 9.46324 0.794681 11.745C0.735106 11.9098 0.735106 12.0902 0.794681 12.255C1.6768 14.5368 3.20819 16.51 5.19958 17.9309C7.19097 19.3518 9.55507 20.1581 11.9997 20.25C14.4443 20.1581 16.8084 19.3518 18.7998 17.9309C20.7912 16.51 22.3226 14.5368 23.2047 12.255C23.2643 12.0902 23.2643 11.9098 23.2047 11.745ZM11.9997 18.75C8.02468 18.75 3.82468 15.8025 2.30218 12C3.82468 8.1975 8.02468 5.25 11.9997 5.25C15.9747 5.25 20.1747 8.1975 21.6972 12C20.1747 15.8025 15.9747 18.75 11.9997 18.75Z" fill={ICON_FILL} fillOpacity={1} />
      <path d="M11.9997 7.5C11.1097 7.5 10.2396 7.76392 9.49961 8.25839C8.75959 8.75285 8.18282 9.45566 7.84222 10.2779C7.50163 11.1002 7.41251 12.005 7.58615 12.8779C7.75978 13.7508 8.18836 14.5526 8.8177 15.182C9.44704 15.8113 10.2489 16.2399 11.1218 16.4135C11.9947 16.5872 12.8995 16.4981 13.7218 16.1575C14.544 15.8169 15.2468 15.2401 15.7413 14.5001C16.2358 13.76 16.4997 12.89 16.4997 12C16.4997 10.8065 16.0256 9.66193 15.1817 8.81802C14.3377 7.97411 13.1932 7.5 11.9997 7.5ZM11.9997 15C11.4063 15 10.8263 14.8241 10.333 14.4944C9.83962 14.1648 9.45511 13.6962 9.22804 13.1481C9.00098 12.5999 8.94157 11.9967 9.05733 11.4147C9.17308 10.8328 9.4588 10.2982 9.87836 9.87868C10.2979 9.45912 10.8325 9.1734 11.4144 9.05764C11.9964 8.94189 12.5996 9.0013 13.1477 9.22836C13.6959 9.45542 14.1644 9.83994 14.4941 10.3333C14.8237 10.8266 14.9997 11.4067 14.9997 12C14.9997 12.7957 14.6836 13.5587 14.121 14.1213C13.5584 14.6839 12.7953 15 11.9997 15Z" fill={ICON_FILL} fillOpacity={1} />
    </svg>
  );
}

interface LoginPageProps {
  onLogin: () => void;
  /** Same as Home header — opens settings modal when provided. */
  onOpenSettings?: () => void;
}

function IteroLogo() {
  return (
    <svg width="71" height="28" viewBox="0 0 71 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M63.2389 19.7792C63.2417 18.7027 63.0308 17.6364 62.6182 16.6421C62.2057 15.6478 61.5999 14.7454 60.8358 13.987C59.2477 12.4036 57.0828 11.532 54.7364 11.532C52.3919 11.532 50.2252 12.4036 48.639 13.987C47.8772 14.7461 47.2741 15.6491 46.8649 16.6435C46.4556 17.6379 46.2483 18.7039 46.2551 19.7792C46.2551 22.0073 47.0658 24.0664 48.5746 25.579C50.1307 27.1397 52.3202 28 54.7364 28C57.1527 28 59.3422 27.1397 60.9001 25.579C62.407 24.0664 63.2389 22.0073 63.2389 19.7792ZM59.4197 19.7792C59.4197 22.3042 57.2321 24.5192 54.7364 24.5192C52.2426 24.5192 50.0531 22.3042 50.0531 19.7792C50.0483 19.1467 50.1696 18.5196 50.4098 17.9344C50.6501 17.3493 51.0045 16.8179 51.4523 16.3712C52.3236 15.5008 53.5048 15.0118 54.7365 15.0118C55.9681 15.0118 57.1493 15.5008 58.0206 16.3712C58.4688 16.8176 58.8234 17.349 59.0636 17.9342C59.3039 18.5194 59.4249 19.1466 59.4197 19.7792ZM40.1254 15.8294H44.7869V11.8713H36.1682V27.7249H40.1254V15.8294ZM20.5939 21.2945H33.0215V20.7378C33.0215 18.0643 32.2312 15.7681 30.7357 14.0977C29.2534 12.4433 27.1358 11.532 24.7743 11.532C22.4506 11.532 20.3481 12.3989 18.8583 13.9738C17.427 15.4855 16.6386 17.5369 16.6386 19.7517C16.6386 21.9185 17.4195 23.9415 18.8356 25.4476C20.4067 27.117 22.6056 28 25.1959 28C27.8145 28 29.9738 27.0196 31.9608 24.9239L29.4216 22.3798C28.2172 23.7799 26.7463 24.5192 25.1675 24.5192C23.9273 24.5192 22.823 24.1401 21.9742 23.4217C21.315 22.8637 20.8349 22.1238 20.5939 21.2945ZM20.577 18.0956C20.9948 16.5584 22.2634 15.0118 24.746 15.0118C26.8219 15.0118 28.4611 16.2521 28.9281 18.0956H20.577ZM13.392 7.91404H18.8675V3.95686H3.95927V7.91404H9.43473V27.7249H13.392V7.91404Z" fill="black" fillOpacity="0.93" />
      <path d="M40.1254 15.8294H44.7869V11.8713H36.1682V27.7249H40.1254V15.8294Z" fill="black" fillOpacity="0.93" />
      <path d="M3.95718 11.8713H0V27.7249H3.95718V11.8713Z" fill="black" fillOpacity="0.93" />
      <path d="M3.95718 0H0V3.95718H3.95718V0Z" fill="black" fillOpacity="0.93" />
      <path d="M64.4516 11.8664H66.8465V12.3382H65.9222V14.8167H65.3708V12.3382H64.4516V11.8664Z" fill="black" fillOpacity="0.93" />
      <path d="M67.2317 11.8664H67.9573L68.4414 13.2707C68.5565 13.6152 68.6992 14.2613 68.6992 14.2613H68.7114C68.7114 14.2613 68.8541 13.6192 68.9652 13.2707L69.4401 11.8664H70.182V14.8167H69.6704V13.2778C69.6704 12.9568 69.7061 12.3586 69.7061 12.3586H69.6979C69.6979 12.3586 69.5756 12.9018 69.4798 13.1953L68.9214 14.8167H68.477L67.9145 13.1953C67.8187 12.9018 67.6964 12.3586 67.6964 12.3586H67.6882C67.6882 12.3586 67.7239 12.9568 67.7239 13.2778V14.8167H67.2317V11.8664Z" fill="black" fillOpacity="0.93" />
    </svg>
  );
}

export default function LoginPage({ onLogin, onOpenSettings }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [batteryModalOpen, setBatteryModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (password.length === 0) {
      setShowPasswordError(true);
      inputRef.current?.focus();
      return;
    }
    setShowPasswordError(false);
    onLogin();
  };

  const handlePasswordFocus = () => {
    setIsFocused(true);
    setShowKeyboard(true);
  };

  const handlePasswordBlur = () => {
    setIsFocused(false);
  };

  const handleKeyPress = (key: string) => {
    setPassword((prev) => prev + key);
  };

  const handleBackspace = () => {
    setPassword((prev) => prev.slice(0, -1));
  };

  const handleCloseKeyboard = () => {
    setShowKeyboard(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--color-background-subtle-00,#f4f4f4)]">
      {/* Header — matches HomePage shell; Profile, Library, Lock, Messages omitted */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          backgroundColor: "var(--color-background-layer-01, #fff)",
          borderBottom: "1px solid var(--color-border-subtle, rgba(0,0,0,0.09))",
          padding: "6px 16px",
        }}
      >
        <div className="flex items-center" style={{ gap: 24, padding: "16px 2px" }}>
          <IteroLogo />
        </div>
        <div className="flex items-center" style={{ gap: 4, height: 60 }}>
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] rounded-lg"
            style={{ width: 60, height: 60, padding: 12, backgroundColor: "transparent" }}
            aria-label="Help"
          >
            <HelpIcon color="var(--color-icon-primary)" />
          </button>
          <button
            type="button"
            onClick={() => setBatteryModalOpen((o) => !o)}
            aria-label="Battery status"
            aria-expanded={batteryModalOpen}
            className={`flex items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${batteryModalOpen ? "bg-[var(--color-background-highlight-blue)]" : ""}`}
            style={{
              width: 60,
              height: 60,
              padding: 12,
              backgroundColor: batteryModalOpen ? undefined : "transparent",
            }}
          >
            <BatteryIcon size={32} color="var(--color-icon-primary)" />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center cursor-pointer border-0 appearance-none outline-none transition-ui hover:bg-[var(--color-background-layer-hovered)] rounded-lg"
            style={{ width: 60, height: 60, padding: 12, backgroundColor: "transparent" }}
            aria-label="Settings"
          >
            <SettingsIcon color="var(--color-icon-primary)" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col items-center justify-center w-full relative bg-[var(--color-page-background)]">
      {/* Widget card */}
      <div
        className="flex flex-col items-center justify-center bg-[var(--color-background-layer-01)]"
        style={{
          width: 400,
          padding: 40,
          borderRadius: 16,
          boxShadow: "0px 16px 40px 0px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex flex-col items-start w-full" style={{ gap: 8 }}>
          {/* Header + inputs group */}
          <div className="flex flex-col items-start w-full" style={{ gap: 24 }}>
            {/* Welcome text — Figma: 24px medium / 32px line-height, then 18px regular / 24px line-height */}
            <div className="flex flex-col items-start w-full text-center text-text-primary" style={{ gap: 8 }}>
              <span
                className="w-full"
                style={{
                  fontFamily: "var(--font-roboto)",
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  letterSpacing: 0,
                }}
              >
                Welcome
              </span>
              <span
                className="w-full text-text-primary"
                style={{
                  fontFamily: "var(--font-roboto)",
                  fontSize: 18,
                  fontWeight: 400,
                  lineHeight: "24px",
                  letterSpacing: 0,
                }}
              >
                Enter your password to continue
              </span>
            </div>

            {/* Input fields */}
            <div className="flex flex-col items-start w-full" style={{ gap: 8 }}>
              {/* Email field (read-only, grey bg) */}
              <div
                className="flex items-center w-full bg-[var(--color-background-layer-02)] overflow-hidden"
                style={{
                  height: 60,
                  borderRadius: 8,
                  padding: "12px 16px",
                  gap: 8,
                }}
              >
                <span className="tp-body-02 text-text-primary flex-1">
                  user@itero.com
                </span>
              </div>

              {/* Password input */}
              <div className="flex flex-col items-start w-full">
                {/* Label row — Figma: 14px regular, 24px line-height (no uppercase) */}
                <div className="flex items-start shrink-0" style={{ paddingBottom: 8, gap: 4 }}>
                  <span
                    className="text-text-secondary"
                    style={{
                      fontFamily: "var(--font-roboto)",
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: "24px",
                      letterSpacing: 0,
                    }}
                  >
                    Password
                  </span>
                  <span
                    className="text-[var(--color-text-error)]"
                    style={{
                      fontFamily: "var(--font-roboto)",
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: "24px",
                      letterSpacing: 0,
                    }}
                  >
                    *
                  </span>
                </div>
                {/* Field — fixed 60px height, no flex grow */}
                <div
                  className="flex items-center shrink-0 w-full bg-[var(--color-background-layer-01)] overflow-hidden"
                  style={{
                    height: 60,
                    minHeight: 60,
                    maxHeight: 60,
                    borderRadius: 8,
                    padding: "12px 16px",
                    gap: 8,
                    border: showPasswordError
                      ? "1px solid var(--color-text-error)"
                      : isFocused
                        ? "1px solid var(--color-border-focus)"
                        : "1px solid var(--color-border-subtle)",
                  }}
                >
                  <input
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (showPasswordError) setShowPasswordError(false);
                    }}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter password"
                    className="flex-1 min-w-0 tp-body-02 text-text-primary bg-transparent border-0 outline-none p-0 placeholder:text-text-tertiary"
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-0 outline-none p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOnIcon /> : <VisibilityOffIcon />}
                  </button>
                </div>
                {showPasswordError && (
                  <span
                    className="text-[var(--color-text-error)]"
                    style={{
                      fontFamily: "var(--font-roboto)",
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: "24px",
                      marginTop: 4,
                    }}
                  >
                    Please enter your password
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Forgot password link */}
          <button
            type="button"
            className="flex items-center w-full bg-transparent border-0 cursor-pointer p-0 tp-body-02 text-[var(--color-text-link)] overflow-hidden"
            style={{ height: 64, gap: 8 }}
          >
            Forgot password?
          </button>

          {/* Log in button + different user link */}
          <div className="flex flex-col items-start w-full" style={{ gap: 24 }}>
            <button
              type="button"
              onClick={handleLogin}
              className="flex items-center justify-center w-full cursor-pointer border-0 outline-none tp-body-02 text-[var(--color-text-on-color-primary)] transition-ui"
              style={{
                height: 60,
                borderRadius: 8,
                padding: "12px 16px",
                minWidth: 72,
                gap: 8,
                backgroundColor: "var(--color-background-brand)",
              }}
            >
              Log in
            </button>

            <div
              className="flex items-center justify-center w-full overflow-hidden"
              style={{ height: 64, gap: 8 }}
            >
              <button
                type="button"
                className="bg-transparent border-0 cursor-pointer p-0 tp-body-02 text-[var(--color-text-link)] whitespace-nowrap"
              >
                Log in with different user
              </button>
            </div>
          </div>
        </div>
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClose={handleCloseKeyboard}
        />
      )}
      </div>

      {batteryModalOpen && <BatteryModal onClose={() => setBatteryModalOpen(false)} level={100} />}
    </div>
  );
}
