/**
 * Patient header for scanning flow — Figma 4115:166709 (UI Refresh 2025).
 * Avatar | Name + ID | DOB | Gender | Last scan | separator | Treated by | Edit button.
 *
 * Typography (all via .scan-flow scope):
 *   name   = tp-heading-05 (28px/40px, 500)
 *   labels = tp-body-02 text-secondary (18px/28px, 400)
 *   values = tp-body-02 text-primary   (18px/28px, 400)
 *   id     = tp-body-02 text-secondary
 *
 * Layout (4px grid): px var(--spacing-10), py var(--spacing-03), row 80px,
 * gap var(--spacing-12) between items, var(--spacing-10) before edit button.
 */

import Avatar from "./Avatar";
import { PencilIcon } from "./Icons";

function IdCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 3.75V16.25H2.5V3.75H17.5ZM17.5 2.5H2.5C2.16848 2.5 1.85054 2.6317 1.61612 2.86612C1.3817 3.10054 1.25 3.41848 1.25 3.75V16.25C1.25 16.5815 1.3817 16.8995 1.61612 17.1339C1.85054 17.3683 2.16848 17.5 2.5 17.5H17.5C17.8315 17.5 18.1495 17.3683 18.3839 17.1339C18.6183 16.8995 18.75 16.5815 18.75 16.25V3.75C18.75 3.41848 18.6183 3.10054 18.3839 2.86612C18.1495 2.6317 17.8315 2.5 17.5 2.5Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M8.125 6.25H3.75V7.5H8.125V6.25Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M6.25 8.75H3.75V10H6.25V8.75Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M14.375 11.25H10.625C10.1277 11.25 9.65081 11.4475 9.29917 11.7992C8.94754 12.1508 8.75 12.6277 8.75 13.125V14.375H10V13.125C10 12.9592 10.0658 12.8003 10.1831 12.6831C10.3003 12.5658 10.4592 12.5 10.625 12.5H14.375C14.5408 12.5 14.6997 12.5658 14.8169 12.6831C14.9342 12.8003 15 12.9592 15 13.125V14.375H16.25V13.125C16.25 12.6277 16.0525 12.1508 15.7008 11.7992C15.3492 11.4475 14.8723 11.25 14.375 11.25Z" fill="currentColor" fillOpacity={0.93} />
      <path d="M12.5 10.625C12.9945 10.625 13.4778 10.4784 13.8889 10.2037C14.3 9.92897 14.6205 9.53852 14.8097 9.08171C14.9989 8.62489 15.0484 8.12223 14.952 7.63727C14.8555 7.15232 14.6174 6.70686 14.2678 6.35723C13.9181 6.0076 13.4727 5.7695 12.9877 5.67304C12.5028 5.57657 12.0001 5.62608 11.5433 5.8153C11.0865 6.00452 10.696 6.32495 10.4213 6.73607C10.1466 7.1472 10 7.63055 10 8.125C10 8.78804 10.2634 9.42393 10.7322 9.89277C11.2011 10.3616 11.837 10.625 12.5 10.625ZM12.5 6.875C12.7472 6.875 12.9889 6.94831 13.1945 7.08566C13.4 7.22301 13.5602 7.41824 13.6549 7.64665C13.7495 7.87505 13.7742 8.12639 13.726 8.36886C13.6778 8.61134 13.5587 8.83407 13.3839 9.00888C13.2091 9.1837 12.9863 9.30275 12.7439 9.35098C12.5014 9.39921 12.2501 9.37446 12.0216 9.27985C11.7932 9.18524 11.598 9.02502 11.4607 8.81946C11.3233 8.6139 11.25 8.37223 11.25 8.125C11.25 7.79348 11.3817 7.47554 11.6161 7.24112C11.8505 7.0067 12.1685 6.875 12.5 6.875Z" fill="currentColor" fillOpacity={0.93} />
    </svg>
  );
}

function calculateAge(dob: string): number {
  const parts = dob.split("/").map(Number);
  if (parts.length < 3) return 0;
  const [month, day, year] = parts;
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export interface ScanFlowPatientHeaderProps {
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  treatedBy: string;
  lastScan?: string;
  avatarUrl?: string;
  onEditClick?: () => void;
}

export default function ScanFlowPatientHeader({
  patientName,
  patientId,
  dateOfBirth,
  gender,
  treatedBy,
  lastScan,
  avatarUrl,
  onEditClick,
}: ScanFlowPatientHeaderProps) {
  const [firstName = "Patient", ...rest] = patientName.trim().split(/\s+/);
  const lastName = rest.length ? rest.join(" ") : "";
  const age = calculateAge(dateOfBirth);

  return (
    <section
      className="flex items-center justify-center w-full bg-surface shrink-0 border-b border-border-subtle overflow-clip"
      style={{ padding: "var(--spacing-03) var(--spacing-10)", height: 138 }}
      aria-label="Patient information"
    >
      <div
        className="flex items-center w-full min-w-0"
        style={{ height: 80, gap: "var(--spacing-10)" }}
      >
        <div
          className="flex flex-1 items-center min-w-0"
          style={{ gap: "var(--spacing-12)" }}
        >
          <Avatar
            firstName={firstName}
            lastName={lastName}
            imageUrl={avatarUrl}
            size={80}
            initialsFontSize={28}
          />

          <div
            className="flex flex-col items-start shrink-0"
            style={{ gap: "var(--spacing-02)", width: "fit-content", height: 76 }}
          >
            <span className="tp-heading-05 text-text-primary" style={{ width: "fit-content" }}>
              {patientName}
            </span>
            <span className="inline-grid shrink-0">
              <span
                className="tp-body-02 text-text-secondary whitespace-nowrap"
                style={{ gridColumn: 1, gridRow: 1, marginLeft: 29 }}
              >
                {patientId}
              </span>
              <span
                className="shrink-0 text-[var(--color-icon-primary)] overflow-clip"
                style={{ gridColumn: 1, gridRow: 1, marginTop: 2, width: 20, height: 20 }}
                aria-hidden
              >
                <IdCardIcon />
              </span>
            </span>
          </div>

          <InfoColumn label="Date of birth" value={`${dateOfBirth} (${age} years)`} />
          <InfoColumn label="Gender" value={gender} />
          {lastScan && <InfoColumn label="Last scan" value={lastScan} />}

          <div className="flex items-center self-stretch" aria-hidden>
            <div
              className="shrink-0"
              style={{
                width: 0,
                height: 80,
                borderLeft: "1px solid var(--color-border-subtle)",
              }}
            />
          </div>

          <InfoColumn label="Treated by:" value={treatedBy} />
        </div>

        <button
            type="button"
            onClick={onEditClick}
            className="flex items-center justify-center shrink-0 rounded-lg cursor-pointer hover:bg-surface-alt transition-ui transition-ui-focus transition-press active-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            style={{
              width: 60,
              height: 60,
              padding: "var(--spacing-03)",
              border: "2px solid var(--color-border-subtle)",
              backgroundColor: "transparent",
            }}
            aria-label="Edit patient"
          >
            <PencilIcon size={24} color="var(--color-icon-primary)" />
          </button>
      </div>
    </section>
  );
}

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-start shrink-0 whitespace-nowrap tp-body-02"
      style={{ gap: "var(--spacing-01)" }}
    >
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}
