import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { SearchIcon, CloseIcon } from "./Icons";

const INPUT_ID = "search-patient-input";

export interface SearchInputRef {
  blur: () => void;
  focus: () => void;
}

interface SearchInputProps {
  value: string;
  isFocused: boolean;
  onFocus: () => void;
  onBlur?: () => void;
  onChange: (value: string) => void;
  onClear: () => void;
  /** Default "Search patient" */
  placeholder?: string;
  /** Default same as placeholder */
  ariaLabel?: string;
  /** Optional unique ID when multiple SearchInputs on page */
  id?: string;
}

const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(function SearchInput(
  {
    value,
    isFocused,
    onFocus,
    onBlur,
    onChange,
    onClear,
    placeholder = "Search patient",
    ariaLabel,
    id: propId,
  },
  ref
) {
  const inputId = propId ?? INPUT_ID;
  const effectiveAriaLabel = ariaLabel ?? placeholder;
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    blur: () => inputRef.current?.blur(),
    focus: () => inputRef.current?.focus(),
  }), []);

  // When parent sets isFocused (e.g. after click), ensure the input actually receives focus
  useEffect(() => {
    if (isFocused && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-[288px] xl:max-w-[400px] min-w-0 shrink-0 rounded-lg" dir="ltr">
      <div
        role="search"
        className={`
          flex items-center gap-2 h-[var(--height-row)] rounded-lg bg-surface-alt overflow-hidden
          border border-solid transition-ui cursor-text text-left
          ${isActive ? "border-border-interactive" : "border-border-subtle"}
          focus-within:border-focus-border
        `}
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
        onClick={handleContainerClick}
      >
        {/* Label wraps icon + field so clicking focuses the input */}
        <label
          htmlFor={inputId}
          className="flex flex-1 items-center gap-2 min-w-0 order-2 cursor-text"
        >
          {!isActive && (
            <SearchIcon
              size={24}
              color="var(--color-icon-tertiary)"
              className="shrink-0 order-first"
              aria-hidden
            />
          )}

          <div className="w-fit min-w-[8rem] flex items-center relative overflow-hidden text-left">
            {isActive ? (
              <>
                {/* Visible text + caret inside the field */}
                <div
                  className="tp-body-03 flex items-center w-fit overflow-hidden pointer-events-none text-left text-text-primary"
                  aria-hidden
                >
                  <span className="truncate max-w-[200px]">{value}</span>
                  {isFocused && (
                    <span className="search-caret shrink-0 text-text-primary" aria-hidden>
                      |
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span
                className="tp-body-03 text-text-tertiary truncate text-left"
                aria-hidden
              >
                {placeholder}
              </span>
            )}

            {/* Single visible-to-a11y input: full area for focus/click, visually overlaid by mirror/placeholder */}
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              role="searchbox"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              className="absolute inset-0 w-full bg-transparent outline-none opacity-0 tp-body-03 text-text-primary cursor-text text-left"
              placeholder={placeholder}
              autoComplete="off"
              readOnly
              aria-label={effectiveAriaLabel}
            />
          </div>
        </label>

        {hasValue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="shrink-0 p-0 border-0 bg-transparent cursor-pointer order-last rounded transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-border focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt"
            aria-label="Clear search"
          >
            <CloseIcon size={24} color="var(--color-icon-tertiary)" />
          </button>
        )}
      </div>
    </div>
  );
});

export default SearchInput;
