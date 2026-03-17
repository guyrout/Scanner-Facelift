import { useState, useMemo, useRef } from "react";
import OrdersHeader from "./OrdersHeader";
import Avatar from "./Avatar";
import DoctorSiteLoginModal from "./DoctorSiteLoginModal";
import SearchInput from "./SearchInput";
import type { SearchInputRef } from "./SearchInput";
import VirtualKeyboard from "./VirtualKeyboard";
import { InvisalignLogoIcon } from "./Icons";
import { getAllOrdersForOrdersPage } from "../data/orders";
import type { OrderStatus, OrderWithPatient } from "../data/orders";

/** Figma: expanded row actions — same as Patient Orders */
const EXPANDED_ACTIONS = [
  { id: "view-rx", label: "View RX" },
  { id: "open-viewer", label: "Open Viewer" },
  { id: "align-oral", label: "Align Oral Health Suite" },
  { id: "itero-report", label: "iTero Scan Report" },
  { id: "simulator-pro", label: "Invisalign Outcome Simulator Pro", withLogo: true },
  { id: "simulator", label: "Invisalign Outcome Simulator" },
  { id: "progress", label: "Invisalign Progress Assessment" },
] as const;

const ROW_PADDING_X = "pl-4 pr-4";
const HEADER_LABEL = "tp-body-04 text-text-secondary truncate";
const BODY_LABEL = "tp-body-04 text-text-primary truncate";

const ORDERS_COLUMNS = [
  { id: "orderId" as const, label: "Order ID", minWidth: "min-w-[120px]" },
  { id: "patient" as const, label: "Patient", minWidth: "min-w-[200px]" },
  { id: "procedure" as const, label: "Procedure", minWidth: "min-w-[160px]" },
  { id: "niri" as const, label: "Niri", minWidth: "min-w-[72px]" },
  { id: "scanDate" as const, label: "Scan Date", minWidth: "min-w-[120px]" },
  { id: "lastModified" as const, label: "Last Modified", minWidth: "min-w-[120px]" },
  { id: "status" as const, label: "Status", minWidth: "min-w-[120px]", showSortIcon: true },
] as const;

const BADGE_BASE =
  "shrink-0 inline-flex items-center justify-center tp-body-04 whitespace-nowrap rounded border border-solid min-h-[36px] h-[36px] py-2 px-3";

function StatusCell({ status }: { status: OrderStatus }) {
  if (status === "completed") {
    return (
      <span
        className={BADGE_BASE}
        style={{
          backgroundColor: "var(--color-background-highlight-green)",
          color: "var(--color-text-on-highlight-green)",
          borderColor: "var(--color-border-highlight-green)",
        }}
      >
        Completed
      </span>
    );
  }
  if (status === "sent_to_lab") {
    return (
      <span
        className={BADGE_BASE}
        style={{
          backgroundColor: "var(--color-background-highlight-blue)",
          color: "var(--color-text-on-highlight-blue)",
          borderColor: "var(--color-border-highlight-blue)",
        }}
      >
        Sent to lab
      </span>
    );
  }
  return (
    <span
      className={BADGE_BASE}
      style={{
        backgroundColor: "var(--color-background-highlight-gray)",
        color: "var(--color-text-primary)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      Rx created
    </span>
  );
}

function SortDescIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
      <path d="M2 4h12M2 8h8M2 12h4" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 10v4M12 14l-1.5-1.5M12 14l1.5-1.5" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function filterPastOrders(orders: OrderWithPatient[], query: string): OrderWithPatient[] {
  if (!query.trim()) return orders;
  const q = query.trim().toLowerCase();
  return orders.filter(
    (row) =>
      row.orderId.toLowerCase().includes(q) ||
      row.procedure.toLowerCase().includes(q) ||
      `${row.patient.firstName} ${row.patient.lastName}`.toLowerCase().includes(q) ||
      row.patient.patientId.toLowerCase().includes(q)
  );
}

const SECTION_PADDING = {
  paddingTop: "var(--spacing-04)",
  paddingBottom: "var(--spacing-04)",
  paddingLeft: 16,
  paddingRight: 16,
};

interface OrdersPageProps {
  selectedDoctorName?: string | null;
  selectedDentistId?: string;
  onDentistChange?: (id: string) => void;
  onBack: () => void;
  onOpenSettings?: () => void;
}

function getRowKey(row: OrderWithPatient): string {
  return `${row.patient.id}-${row.orderId}`;
}

/** Virtual keyboard height so we reserve space and don't cover content */
const KEYBOARD_HEIGHT = 340;

export default function OrdersPage({
  selectedDoctorName,
  selectedDentistId,
  onDentistChange,
  onBack,
  onOpenSettings,
}: OrdersPageProps) {
  const { inProgress: rawInProgress, past: rawPast } = useMemo(() => getAllOrdersForOrdersPage(), []);
  const { inProgress, past } = useMemo(() => {
    if (!selectedDoctorName) return { inProgress: rawInProgress, past: rawPast };
    return {
      inProgress: rawInProgress.filter((row) => row.patient.doctor === selectedDoctorName),
      past: rawPast.filter((row) => row.patient.doctor === selectedDoctorName),
    };
  }, [rawInProgress, rawPast, selectedDoctorName]);
  const [pastSearch, setPastSearch] = useState("");
  const [pastSearchFocused, setPastSearchFocused] = useState(false);
  const pastSearchRef = useRef<SearchInputRef>(null);
  const pastFiltered = useMemo(() => filterPastOrders(past, pastSearch), [past, pastSearch]);
  const hasSearchQuery = pastSearch.trim().length > 0;
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [showDoctorSiteLoginModal, setShowDoctorSiteLoginModal] = useState(false);

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-page-bg relative">
      <OrdersHeader
        onHomeClick={onBack}
        onSettingsClick={onOpenSettings}
        selectedDentistId={selectedDentistId}
        onDentistChange={onDentistChange}
      />

      {/* No page-level scroll: fixed viewport, only table bodies scroll (eliminates nested scroll conflict) */}
      <div
        className="flex-1 flex flex-col w-full min-w-0 min-h-0 overflow-hidden transition-[padding] duration-[360ms] ease-[var(--motion-ease-out-soft)]"
        style={{
          padding: 16,
          paddingBottom: pastSearchFocused ? KEYBOARD_HEIGHT : 16,
        }}
      >
        <div
          className="flex flex-col flex-1 w-full min-w-0 min-h-0 overflow-hidden"
          style={{ gap: "var(--spacing-04)" }}
        >
          {/* Card 1: In Progress — collapses when keyboard open so Past Orders gets focus */}
          <div
            className="flex flex-col bg-surface rounded-xl overflow-hidden transition-[flex,max-height,min-height,padding] duration-[360ms] ease-[var(--motion-ease-out-soft)]"
            style={{
              boxShadow: "var(--shadow-card)",
              flex: pastSearchFocused ? "0 0 auto" : "1 1 0%",
              minHeight: pastSearchFocused ? 0 : undefined,
              maxHeight: pastSearchFocused ? 72 : undefined,
            }}
          >
            <div
              className="flex flex-col shrink-0 overflow-hidden transition-[margin] duration-[360ms] ease-[var(--motion-ease-out-soft)]"
              style={{ ...SECTION_PADDING, marginBottom: pastSearchFocused ? 0 : undefined }}
            >
              <h2 className="tp-heading-02 text-text-primary truncate">In Progress</h2>
            </div>
            <div
              className="flex-1 min-h-0 min-w-0 overflow-hidden transition-[max-height,opacity] duration-[360ms] ease-[var(--motion-ease-out-soft)]"
              style={{
                maxHeight: pastSearchFocused ? 0 : 2000,
                opacity: pastSearchFocused ? 0 : 1,
              }}
            >
              <div className="h-full min-h-0 overflow-y-auto overflow-x-auto scrollbar-table table-no-select">
                <OrdersTable
                  rows={inProgress}
                  selectedRowKey={selectedRowKey}
                  onRowSelect={(key) => setSelectedRowKey(selectedRowKey === key ? null : key)}
                  onExpandedActionClick={(id) => {
                    if (id === "simulator-pro") setShowDoctorSiteLoginModal(true);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Past Orders — gets full visible area when keyboard open */}
          <div
            className="flex flex-col flex-1 min-h-0 bg-surface rounded-xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex flex-col shrink-0" style={{ ...SECTION_PADDING }}>
              <h2 className="tp-heading-02 text-text-primary mb-4">Past Orders</h2>
              <SearchInput
                ref={pastSearchRef}
                id="search-orders-input"
                value={pastSearch}
                isFocused={pastSearchFocused}
                onFocus={() => setPastSearchFocused(true)}
                onBlur={() => setPastSearchFocused(false)}
                onChange={setPastSearch}
                onClear={() => {
                  setPastSearch("");
                  setPastSearchFocused(false);
                }}
                placeholder="Search orders"
                ariaLabel="Search orders"
              />
            </div>
            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-auto scrollbar-table table-no-select">
              {hasSearchQuery && pastFiltered.length === 0 ? (
                <div
                  className={`flex items-center justify-center w-full border-t border-border-subtle ${ROW_PADDING_X}`}
                  style={{ minHeight: 72 }}
                >
                  <p className="tp-body-04 text-text-secondary">
                    No result for search &apos;{pastSearch.trim()}&apos;.
                  </p>
                </div>
              ) : (
                <OrdersTable
                  rows={pastFiltered}
                  selectedRowKey={selectedRowKey}
                  onRowSelect={(key) => setSelectedRowKey(selectedRowKey === key ? null : key)}
                  onExpandedActionClick={(id) => {
                    if (id === "simulator-pro") setShowDoctorSiteLoginModal(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showDoctorSiteLoginModal && (
        <DoctorSiteLoginModal onClose={() => setShowDoctorSiteLoginModal(false)} />
      )}

      {pastSearchFocused && (
        <VirtualKeyboard
          onKeyPress={(key) => setPastSearch((prev) => prev + key)}
          onBackspace={() => setPastSearch((prev) => prev.slice(0, -1))}
          onClose={() => {
            pastSearchRef.current?.blur();
            setPastSearchFocused(false);
          }}
        />
      )}
    </div>
  );
}

function OrdersTable({
  rows,
  selectedRowKey,
  onRowSelect,
  onExpandedActionClick,
}: {
  rows: OrderWithPatient[];
  selectedRowKey: string | null;
  onRowSelect: (key: string) => void;
  onExpandedActionClick?: (actionId: string) => void;
}) {
  return (
    <div className="flex flex-col w-full min-w-[640px] max-w-full table-no-select">
      <div
        className={`flex items-center gap-4 w-full min-h-[52px] max-h-[52px] border-b border-border-subtle shrink-0 sticky top-0 bg-surface z-10 ${ROW_PADDING_X}`}
      >
        {ORDERS_COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`flex flex-1 items-center min-w-0 ${col.minWidth} ${"showSortIcon" in col && col.showSortIcon ? "gap-2" : ""}`}
          >
            <span className={HEADER_LABEL}>{col.label}</span>
            {"showSortIcon" in col && col.showSortIcon && <SortDescIcon />}
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <div
          className={`flex items-center justify-center w-full border-b border-border-subtle ${ROW_PADDING_X}`}
          style={{ minHeight: 72 }}
        >
          <p className="tp-body-04 text-text-secondary">No orders found.</p>
        </div>
      ) : (
        rows.map((row) => (
          <OrderRow
            key={getRowKey(row)}
            row={row}
            isSelected={selectedRowKey === getRowKey(row)}
            onRowClick={() => onRowSelect(getRowKey(row))}
            onExpandedActionClick={onExpandedActionClick}
          />
        ))
      )}
    </div>
  );
}

function OrderRow({
  row,
  isSelected,
  onRowClick,
  onExpandedActionClick,
}: {
  row: OrderWithPatient;
  isSelected: boolean;
  onRowClick: () => void;
  onExpandedActionClick?: (actionId: string) => void;
}) {
  return (
    <div
      className={`flex flex-col w-full cursor-pointer transition-ui border-b border-border-subtle hover:bg-surface-alt/50 focus-within:bg-surface-alt/30 ${ROW_PADDING_X}`}
      style={{
        ...(isSelected ? { backgroundColor: "var(--color-background-highlight-blue)" } : {}),
      }}
      onClick={onRowClick}
    >
      <div className="flex items-center gap-4 w-full min-w-0 min-h-[72px]">
        <div className={`flex flex-1 items-center min-h-[72px] min-w-0 ${ORDERS_COLUMNS[0].minWidth}`}>
          <span className={`${BODY_LABEL} ${isSelected ? "text-text-link" : ""}`}>{row.orderId}</span>
        </div>
        <div className={`flex flex-1 items-center gap-3 min-h-[72px] min-w-0 ${ORDERS_COLUMNS[1].minWidth}`}>
          <Avatar
            firstName={row.patient.firstName}
            lastName={row.patient.lastName}
            imageUrl={row.patient.avatarUrl}
            size={40}
          />
          <div className="flex flex-col justify-center min-w-0 gap-0.5">
            <span className={`${BODY_LABEL} truncate`}>
              {row.patient.firstName} {row.patient.lastName}
            </span>
            <span className="tp-label-02 text-text-secondary truncate">{row.patient.patientId}</span>
          </div>
        </div>
        <div className={`flex flex-1 items-center min-h-[72px] min-w-0 ${ORDERS_COLUMNS[2].minWidth}`}>
          <span className={`${BODY_LABEL} truncate`}>{row.procedure}</span>
        </div>
        <div className={`flex flex-1 items-center min-h-[72px] min-w-0 ${ORDERS_COLUMNS[3].minWidth}`}>
          <span className={BODY_LABEL}>{row.niri ? "Yes" : "No"}</span>
        </div>
        <div className={`flex flex-1 items-center min-h-[72px] min-w-0 ${ORDERS_COLUMNS[4].minWidth}`}>
          <span className={BODY_LABEL}>{row.scanDate}</span>
        </div>
        <div className={`flex flex-1 items-center min-h-[72px] min-w-0 ${ORDERS_COLUMNS[5].minWidth}`}>
          <span className={BODY_LABEL}>{row.lastModified}</span>
        </div>
        <div className={`flex flex-1 items-center min-h-[72px] min-w-0 ${ORDERS_COLUMNS[6].minWidth}`}>
          <StatusCell status={row.status} />
        </div>
      </div>

      {isSelected && (
        <div
          className="flex flex-wrap items-center gap-3 pb-4 pt-2"
          style={{ paddingLeft: 0, paddingRight: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {EXPANDED_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onExpandedActionClick?.(action.id)}
              className="tp-body-04 h-[var(--height-row)] rounded-lg bg-surface text-text-primary hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press cursor-pointer whitespace-nowrap border border-border-accent px-4 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface hover:border-[var(--color-border-accent-hovered)]"
            >
              {"withLogo" in action && action.withLogo && <InvisalignLogoIcon className="shrink-0 text-text-primary" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
