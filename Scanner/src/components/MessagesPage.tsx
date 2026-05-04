/**
 * Messages inbox — Figma UI-Refresh-2026 Q2 (4383:208127 with messages, 4383:209427 search empty).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import OrdersHeader from "./OrdersHeader";
import SearchInput from "./SearchInput";
import type { SearchInputRef } from "./SearchInput";
import VirtualKeyboard from "./VirtualKeyboard";
import Avatar from "./Avatar";
import { SearchIcon } from "./Icons";
import { MOCK_MESSAGES, filterMessages, type InboxMessage } from "../data/messages";

const KEYBOARD_HEIGHT = 340;

const MARK_UNREAD_BUTTON_CLASS =
  "tp-body-04 min-h-[60px] h-[var(--height-row)] rounded-lg border-2 border-solid border-border-subtle bg-surface text-text-primary hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press cursor-pointer px-8 flex items-center justify-center min-w-[100px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2";

interface MessagesPageProps {
  selectedDentistId?: string;
  onDentistChange?: (id: string) => void;
  onBack: () => void;
  onOpenSettings?: () => void;
  onOpenSupport?: () => void;
}

export default function MessagesPage({
  selectedDentistId,
  onDentistChange,
  onBack,
  onOpenSettings,
  onOpenSupport,
}: MessagesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<SearchInputRef>(null);
  const filtered = useMemo(() => filterMessages(MOCK_MESSAGES, searchQuery), [searchQuery]);
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showNoMatches = hasSearchQuery && filtered.length === 0;

  const [selectedId, setSelectedId] = useState<string | null>(() => MOCK_MESSAGES[0]?.id ?? null);

  useEffect(() => {
    setSelectedId((prev) => {
      if (prev != null && filtered.some((m) => m.id === prev)) return prev;
      return filtered[0]?.id ?? null;
    });
  }, [filtered]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return filtered.find((m) => m.id === selectedId) ?? null;
  }, [filtered, selectedId]);

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-page-bg relative">
      <OrdersHeader
        title="Messages"
        onHomeClick={onBack}
        onSettingsClick={onOpenSettings}
        onSupportClick={onOpenSupport}
        selectedDentistId={selectedDentistId}
        onDentistChange={onDentistChange}
      />

      <div
        className="flex-1 flex flex-row gap-4 w-full min-w-0 min-h-0 overflow-hidden transition-[padding] duration-[360ms] ease-[var(--motion-ease-out-soft)]"
        style={{
          padding: 16,
          paddingBottom: searchFocused ? KEYBOARD_HEIGHT : 16,
        }}
      >
        {/* Left: list + search — Figma ~422px white card */}
        <div
          className="flex flex-col shrink-0 w-full max-w-[422px] min-h-0 bg-surface rounded-lg overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex flex-col gap-4 py-4 min-h-0 flex-1 min-w-0">
            <div className="flex items-start gap-2 px-4 shrink-0 min-h-[44px] max-h-[64px]">
              <SearchInput
                ref={searchRef}
                id="search-messages-input"
                value={searchQuery}
                isFocused={searchFocused}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onChange={setSearchQuery}
                onClear={() => {
                  setSearchQuery("");
                  setSearchFocused(false);
                }}
                placeholder="Search"
                ariaLabel="Search messages"
                typographyClassName="tp-body-04"
                containerClassName="flex-1 min-w-0 rounded-lg"
              />
              <button
                type="button"
                className="shrink-0 flex items-center justify-center rounded-lg border-2 border-solid border-border-subtle bg-surface hover:bg-surface-alt transition-ui transition-ui-focus cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                style={{ width: 60, height: 60, padding: 12 }}
                aria-label="Search"
                onClick={() => searchRef.current?.focus()}
              >
                <SearchIcon size={24} color="var(--color-icon-primary)" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-table">
              {showNoMatches ? (
                <div
                  className="flex items-center min-h-[92px] px-4 border-t border-border-subtle border-b border-border-subtle"
                  role="status"
                >
                  <p className="tp-body-04 text-text-secondary truncate">No matches were found</p>
                </div>
              ) : (
                filtered.map((msg) => (
                  <MessageListRow
                    key={msg.id}
                    message={msg}
                    isSelected={msg.id === selectedId}
                    onClick={() => setSelectedId(msg.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: detail — Figma white card, flex 1 */}
        <div
          className="flex flex-col flex-1 min-w-0 min-h-0 bg-surface rounded-lg overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex flex-col flex-1 min-h-0 w-full">
            <div className="shrink-0 px-4 pt-4">
              <div className="flex items-center gap-4 min-h-[92px] px-4 py-4 border-b border-border-subtle w-full">
                <p
                  className={`tp-body-04 flex-1 min-w-0 truncate ${
                    selected && !showNoMatches ? "text-text-primary" : "text-transparent select-none"
                  }`}
                  aria-hidden={!selected || showNoMatches}
                >
                  {selected?.title ?? "\u00a0"}
                </p>
                {selected && !showNoMatches ? (
                  <>
                    <p className="tp-body-04 text-text-primary whitespace-nowrap shrink-0">{selected.dateLabel}</p>
                    <p className="tp-body-04 text-text-primary whitespace-nowrap shrink-0 tabular-nums">
                      {selected.timeLabel}
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col pt-8 px-8 overflow-y-auto scrollbar-table">
              {selected && !showNoMatches ? (
                <div
                  className="rounded-lg border border-solid border-border-subtle bg-surface-alt p-4 w-full max-w-[870px]"
                  style={{ alignSelf: "flex-start" }}
                >
                  <p className="tp-body-04 text-text-primary whitespace-pre-wrap">{selected.body}</p>
                </div>
              ) : (
                <div className="flex-1 min-h-[200px] w-full max-w-[870px]" aria-hidden />
              )}
            </div>

            <div className="shrink-0 border-t border-border-accent px-4 flex min-h-[92px] items-center justify-center">
              <button type="button" className={MARK_UNREAD_BUTTON_CLASS}>
                Mark as Unread
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchFocused && (
        <VirtualKeyboard
          onKeyPress={(key) => setSearchQuery((prev) => prev + key)}
          onBackspace={() => setSearchQuery((prev) => prev.slice(0, -1))}
          onClose={() => {
            searchRef.current?.blur();
            setSearchFocused(false);
          }}
        />
      )}
    </div>
  );
}

function MessageListRow({
  message,
  isSelected,
  onClick,
}: {
  message: InboxMessage;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full text-left border-0 cursor-pointer transition-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)] ${
        isSelected
          ? "bg-[var(--color-background-highlight-blue)] border-b border-border-subtle"
          : "bg-transparent border-b border-border-subtle hover:bg-surface-alt/50"
      }`}
    >
      <div className="flex flex-1 min-w-0 items-center gap-4 px-4 py-4 min-h-[92px] max-h-[92px] pr-4">
        <Avatar firstName={message.avatarFirstName} lastName={message.avatarLastName} size={36} />
        <div className="flex flex-col gap-1 min-w-0 flex-1 justify-center">
          <p className="tp-body-04 text-text-primary truncate">{message.title}</p>
          <p className="tp-body-04 text-text-secondary truncate">{message.preview}</p>
        </div>
      </div>
    </button>
  );
}
