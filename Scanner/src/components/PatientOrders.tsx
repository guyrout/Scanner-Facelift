import { useState, useRef, useEffect } from "react";
import Header from "./Header";
import Avatar from "./Avatar";
import DoctorSiteLoginModal from "./DoctorSiteLoginModal";
import { InvisalignLogoIcon } from "./Icons";
import type { Patient } from "../data/patients";
import { getOrdersForPatient } from "../data/orders";
import type { Order, OrderStatus } from "../data/orders";

interface PatientOrdersProps {
  patient: Patient;
  onBack: () => void;
  onOpenSettings?: () => void;
}

function calculateAge(dob: string): number {
  const [month, day, year] = dob.split("/").map(Number);
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function IdCardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 3.75V16.25H2.5V3.75H17.5ZM17.5 2.5H2.5C2.16848 2.5 1.85054 2.6317 1.61612 2.86612C1.3817 3.10054 1.25 3.41848 1.25 3.75V16.25C1.25 16.5815 1.3817 16.8995 1.61612 17.1339C1.85054 17.3683 2.16848 17.5 2.5 17.5H17.5C17.8315 17.5 18.1495 17.3683 18.3839 17.1339C18.6183 16.8995 18.75 16.5815 18.75 16.25V3.75C18.75 3.41848 18.6183 3.10054 18.3839 2.86612C18.1495 2.6317 17.8315 2.5 17.5 2.5Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M8.125 6.25H3.75V7.5H8.125V6.25Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M6.25 8.75H3.75V10H6.25V8.75Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M14.375 11.25H10.625C10.1277 11.25 9.65081 11.4475 9.29917 11.7992C8.94754 12.1508 8.75 12.6277 8.75 13.125V14.375H10V13.125C10 12.9592 10.0658 12.8003 10.1831 12.6831C10.3003 12.5658 10.4592 12.5 10.625 12.5H14.375C14.5408 12.5 14.6997 12.5658 14.8169 12.6831C14.9342 12.8003 15 12.9592 15 13.125V14.375H16.25V13.125C16.25 12.6277 16.0525 12.1508 15.7008 11.7992C15.3492 11.4475 14.8723 11.25 14.375 11.25Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M12.5 10.625C12.9945 10.625 13.4778 10.4784 13.8889 10.2037C14.3 9.92897 14.6205 9.53852 14.8097 9.08171C14.9989 8.62489 15.0484 8.12223 14.952 7.63727C14.8555 7.15232 14.6174 6.70686 14.2678 6.35723C13.9181 6.0076 13.4727 5.7695 12.9877 5.67304C12.5028 5.57657 12.0001 5.62608 11.5433 5.8153C11.0865 6.00452 10.696 6.32495 10.4213 6.73607C10.1466 7.1472 10 7.63055 10 8.125C10 8.78804 10.2634 9.42393 10.7322 9.89277C11.2011 10.3616 11.837 10.625 12.5 10.625ZM12.5 6.875C12.7472 6.875 12.9889 6.94831 13.1945 7.08566C13.4 7.22301 13.5602 7.41824 13.6549 7.64665C13.7495 7.87505 13.7742 8.12639 13.726 8.36886C13.6778 8.61134 13.5587 8.83407 13.3839 9.00888C13.2091 9.1837 12.9863 9.30275 12.7439 9.35098C12.5014 9.39921 12.2501 9.37446 12.0216 9.27985C11.7932 9.18524 11.598 9.02502 11.4607 8.81946C11.3233 8.6139 11.25 8.37223 11.25 8.125C11.25 7.79348 11.3817 7.47554 11.6161 7.24112C11.8505 7.0067 12.1685 6.875 12.5 6.875Z" fill="currentColor" fillOpacity={0.93} />
    </svg>
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

function PatientInfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-start shrink-0 whitespace-nowrap"
      style={{ gap: 4, fontFamily: "var(--font-roboto)", fontSize: 18, fontWeight: 400, lineHeight: "28px" }}
    >
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}

/** Icon Plus — from Icon Plus.svg (New Scan button) */
function IconPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M12.75 11.25V6H11.25V11.25H6V12.75H11.25V18H12.75V12.75H18V11.25H12.75Z" fill="currentColor" />
    </svg>
  );
}

// Figma: status badges — table font 18px (tp-body-04)
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

const COLUMNS = [
  { id: "orderId" as const, label: "Order ID", minWidth: "min-w-[120px]" },
  { id: "procedure" as const, label: "Procedure", minWidth: "min-w-[160px]" },
  { id: "niri" as const, label: "Niri", minWidth: "min-w-[72px]" },
  { id: "scanDate" as const, label: "Scan Date", minWidth: "min-w-[120px]" },
  { id: "lastModified" as const, label: "Last Modified", minWidth: "min-w-[120px]" },
  { id: "status" as const, label: "Status", minWidth: "min-w-[120px]", showSortIcon: true },
] as const;

/** Figma: expanded row actions — all same white/gray button style */
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

function getUniqueScanDates(orders: Order[]): string[] {
  const set = new Set(orders.map((o) => o.scanDate));
  return Array.from(set).sort();
}

export default function PatientOrders({ patient, onBack, onOpenSettings }: PatientOrdersProps) {
  const orders = getOrdersForPatient(patient.id);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [checkedOrderIds, setCheckedOrderIds] = useState<Set<string>>(new Set());
  const [selectedTimelineKeys, setSelectedTimelineKeys] = useState<Set<string>>(new Set());
  const [showDoctorSiteLoginModal, setShowDoctorSiteLoginModal] = useState(false);
  const age = calculateAge(patient.dateOfBirth);
  const timelineDates = getUniqueScanDates(orders);
  /* When timeline is shown, display at least 2 date cards (Figma); each card has its own key */
  const displayTimelineItems =
    timelineDates.length >= 2
      ? timelineDates.map((date) => ({ date, key: date }))
      : timelineDates.length === 1
        ? [
            { date: timelineDates[0], key: "timeline-0" },
            { date: timelineDates[0], key: "timeline-1" },
          ]
        : [];

  const allOrdersChecked = orders.length > 0 && orders.every((o) => checkedOrderIds.has(o.orderId));
  const someOrdersChecked = orders.some((o) => checkedOrderIds.has(o.orderId));
  const toggleOrderChecked = (orderId: string) => {
    setCheckedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };
  const toggleAllOrders = () => {
    if (allOrdersChecked) setCheckedOrderIds(new Set());
    else setCheckedOrderIds(new Set(orders.map((o) => o.orderId)));
  };
  const toggleTimelineCard = (key: string) => {
    setSelectedTimelineKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  /* Button active only when at least 2 timeline cards are selected (two separate elements) */
  const compareSelectedDisabled = selectedTimelineKeys.size < 2;
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someOrdersChecked && !allOrdersChecked;
  }, [someOrdersChecked, allOrdersChecked]);
  /* Timeline only for patients with more than 4 orders */
  const showTimeline = orders.length > 4;
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeline = (dir: "left" | "right") => {
    const el = timelineScrollRef.current;
    if (!el) return;
    const step = 200;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-page-bg">
      {/* Header: back + "Patient: Name", right = icons (help, document, settings) */}
      <Header
        title={`Patient: ${patient.firstName} ${patient.lastName}`}
        onBack={onBack}
        onSettingsClick={onOpenSettings}
      />

      <section
        className="flex items-center justify-center w-full bg-surface shrink-0 border-b border-border-subtle overflow-clip"
        style={{ padding: "12px 40px", height: 164 }}
        aria-label="Patient information"
      >
        <div className="flex items-center w-full" style={{ height: 140, gap: 16 }}>
          <div className="flex flex-1 items-center justify-between min-w-0">
            <div className="flex flex-1 items-center min-w-0" style={{ gap: 48 }}>
              <Avatar
                firstName={patient.firstName}
                lastName={patient.lastName}
                imageUrl={patient.avatarUrl}
                size={80}
                initialsFontSize={28}
              />

              <div className="flex flex-col items-start shrink-0" style={{ gap: 8 }}>
                <span className="truncate" style={{ fontFamily: "var(--font-roboto)", fontSize: 28, fontWeight: 500, lineHeight: "40px", color: "rgba(0,0,0,0.93)", maxWidth: 220 }}>
                  {patient.firstName} {patient.lastName}
                </span>
                <span className="flex items-center shrink-0" style={{ gap: 8 }}>
                  <span className="shrink-0 text-text-secondary" aria-hidden>
                    <IdCardIcon />
                  </span>
                  <span className="text-text-secondary whitespace-nowrap" style={{ fontFamily: "var(--font-roboto)", fontSize: 18, fontWeight: 400, lineHeight: "28px" }}>
                    {patient.patientId}
                  </span>
                </span>
              </div>

              <PatientInfoColumn label="Date of birth" value={`${patient.dateOfBirth} (${age} years)`} />
              <PatientInfoColumn label="Gender" value={patient.gender} />
            </div>

            <div className="flex items-center shrink-0" style={{ gap: 16, marginLeft: 40 }}>
              <button
                type="button"
                className="flex items-center justify-center cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press whitespace-nowrap bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                style={{ height: 60, paddingLeft: 24, paddingRight: 24, borderRadius: 8, border: "2px solid var(--color-border-subtle)", fontFamily: "var(--font-roboto)", fontSize: 18, fontWeight: 400, lineHeight: "28px" }}
              >
                Align X-ray Insights
              </button>
              <button
                type="button"
                className="flex items-center justify-center cursor-pointer border-0 text-on-color hover:opacity-90 transition-ui transition-ui-focus transition-press active-press whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background-brand)]"
                style={{ height: 60, paddingLeft: 24, paddingRight: 24, gap: 8, borderRadius: 8, backgroundColor: "var(--color-background-brand)", fontFamily: "var(--font-roboto)", fontSize: 18, fontWeight: 400, lineHeight: "28px" }}
              >
                <IconPlus />
                New Scan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content: full width, 16px padding at all screen sizes (same as PatientList) */}
      <div
        className="flex-1 flex flex-col w-full min-w-0 min-h-0"
        style={{ padding: 16 }}
      >
        <div
          className="flex flex-col flex-1 min-h-0 w-full min-w-0 bg-surface rounded-xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {/* Title — Figma: $tp-headling-02 (17px Medium, 24px line-height) */}
          <div
            className="flex items-center shrink-0"
            style={{
              paddingTop: "var(--spacing-04)",
              paddingBottom: "var(--spacing-04)",
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <h2 className="tp-heading-02 text-text-primary">
              Patient Orders
            </h2>
          </div>

          {/* Table: shrinks when Timeline is shown; scrollbar when content overflows (e.g. expanded row) */}
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-auto scrollbar-table table-no-select">
            <div className="flex flex-col w-full min-w-[640px] max-w-full table-no-select">
              {/* Table header — Figma: checkbox + Order ID, Procedure, Niri, Scan Date, Last Modified, Status */}
              <div
                className={`flex items-center gap-4 w-full min-h-[52px] max-h-[52px] border-b border-border-subtle shrink-0 sticky top-0 bg-surface z-10 ${ROW_PADDING_X}`}
              >
                <div className="flex items-center justify-center shrink-0 w-[52px] min-w-[52px]">
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={allOrdersChecked}
                    onChange={toggleAllOrders}
                    aria-label="Select all orders"
                    className="checkbox-scanner rounded"
                  />
                </div>
                {COLUMNS.map((col) => (
                  <div
                    key={col.id}
                    className={`flex flex-1 items-center min-w-0 ${col.minWidth} ${"showSortIcon" in col && col.showSortIcon ? "gap-2" : ""}`}
                  >
                    <span className={HEADER_LABEL}>{col.label}</span>
                    {"showSortIcon" in col && col.showSortIcon && <SortDescIcon />}
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {orders.length === 0 ? (
                <div className={`flex items-center justify-center w-full border-b border-border-subtle ${ROW_PADDING_X}`} style={{ minHeight: 72 }}>
                  <p className="tp-body-04 text-text-secondary">
                    No orders found.
                  </p>
                </div>
              ) : (
                orders.map((order, index) => (
                  <OrderRow
                    key={`${order.orderId}-${index}`}
                    order={order}
                    isSelected={selectedRowIndex === index}
                    isChecked={checkedOrderIds.has(order.orderId)}
                    onRowClick={() => setSelectedRowIndex(selectedRowIndex === index ? null : index)}
                    onCheckboxChange={() => toggleOrderChecked(order.orderId)}
                    onExpandedActionClick={(actionId) => {
                      if (actionId === "simulator-pro") setShowDoctorSiteLoginModal(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timeline — align with PNG: heading, date row with arrows, Compare Selected below right-aligned */}
        {showTimeline && (
        <div
          className="flex flex-col shrink-0 mt-6 bg-surface rounded-xl border border-border-subtle"
          style={{ boxShadow: "var(--shadow-card)", padding: "var(--spacing-04)" }}
        >
          <h2 className="tp-heading-02 text-text-primary mb-4">Timeline</h2>
          {/* Row 1: left arrow + date strip + right arrow (arrows aligned with date boxes) */}
          <div className="flex flex-row items-center gap-2 flex-nowrap">
            <button
              type="button"
              onClick={() => scrollTimeline("left")}
              className="flex items-center justify-center shrink-0 h-[var(--height-row)] w-[var(--height-row)] rounded-lg border-0 bg-transparent text-text-primary hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
              aria-label="Scroll timeline left"
            >
              <span className="inline-flex items-center justify-center w-6 h-6" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-inherit" aria-hidden>
                  <path d="M7.5 12L15 4.5L16.05 5.55L9.6 12L16.05 18.45L15 19.5L7.5 12Z" fill="currentColor" fillOpacity={0.93} />
                </svg>
              </span>
            </button>
            <div
              ref={timelineScrollRef}
              className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto pb-1 scrollbar-table"
            >
              {displayTimelineItems.map(({ date, key }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 shrink-0 h-[var(--height-row)] min-h-[var(--height-row)] px-4 rounded-lg border border-border-accent bg-surface cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedTimelineKeys.has(key)}
                    onChange={() => toggleTimelineCard(key)}
                    className="checkbox-scanner rounded"
                  />
                  <span className="tp-body-03 text-text-primary whitespace-nowrap">{date}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollTimeline("right")}
              className="flex items-center justify-center shrink-0 h-[var(--height-row)] w-[var(--height-row)] rounded-lg border-0 bg-transparent text-text-primary hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
              aria-label="Scroll timeline right"
            >
              <span className="inline-flex items-center justify-center w-6 h-6" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-inherit" aria-hidden>
                  <path d="M16.5 12L8.99995 19.5L7.94995 18.45L14.4 12L7.94995 5.55L8.99995 4.5L16.5 12Z" fill="currentColor" fillOpacity={0.93} />
                </svg>
              </span>
            </button>
          </div>
          {/* Row 2: Compare Selected button right-aligned, with spacing below date row */}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              disabled={compareSelectedDisabled}
              className={`tp-body-03 h-[var(--height-row)] min-h-[var(--height-row)] px-5 rounded-lg border-0 whitespace-nowrap transition-ui transition-ui-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 ${
                compareSelectedDisabled
                  ? "cursor-not-allowed bg-surface-alt text-text-disabled"
                  : "cursor-pointer bg-[var(--color-background-brand)] text-on-color hover:opacity-90 transition-press active-press"
              }`}
            >
              Compare Selected
            </button>
          </div>
        </div>
        )}
      </div>

      {showDoctorSiteLoginModal && (
        <DoctorSiteLoginModal onClose={() => setShowDoctorSiteLoginModal(false)} />
      )}
    </div>
  );
}

function OrderRow({
  order,
  isSelected,
  isChecked,
  onRowClick,
  onCheckboxChange,
  onExpandedActionClick,
}: {
  order: Order;
  isSelected: boolean;
  isChecked: boolean;
  onRowClick: () => void;
  onCheckboxChange: () => void;
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
        <div
          className="flex items-center justify-center shrink-0 w-[52px] min-w-[52px]"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onCheckboxChange}
            aria-label={`Select order ${order.orderId}`}
            className="checkbox-scanner rounded"
          />
        </div>
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`flex flex-1 items-center min-h-[72px] min-w-0 ${col.minWidth}`}
          >
            {col.id === "status" ? (
              <StatusCell status={order.status} />
            ) : col.id === "orderId" ? (
              <span
                className={`${BODY_LABEL} ${isSelected ? "text-text-link" : ""}`}
              >
                {order.orderId}
              </span>
            ) : (
              <span className={BODY_LABEL}>
                {col.id === "niri" ? (order.niri ? "Yes" : "No") : String(order[col.id])}
              </span>
            )}
          </div>
        ))}
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
