import { CaretDownIcon } from "./Icons";
import Avatar from "./Avatar";
import type { Patient } from "../data/patients";

interface PatientTableProps {
  patients: Patient[];
  searchQuery: string;
  showSortIndicator?: boolean;
  onPatientClick?: (patient: Patient) => void;
}

/* Column min-widths; Orders same flex as others, content left-aligned */
const COL = {
  patient: "min-w-[200px]",
  dob: "min-w-[110px]",
  lastScan: "min-w-[120px]",
  doctor: "min-w-[140px]",
  orders: "min-w-[72px]",
} as const;
const ROW_PADDING = "py-4 pr-4"; /* 16px vertical and right padding */

export default function PatientTable({
  patients,
  searchQuery,
  showSortIndicator = false,
  onPatientClick,
}: PatientTableProps) {
  return (
    <div className="flex flex-col w-full min-w-0 max-w-full table-no-select">
      {/* Responsive table: min-width for small screens; fills width on large desktops */}
      <div className="flex min-w-[640px] w-full max-w-full flex-col">
        {/* Table Header - sticky so it stays visible while rows scroll */}
        <div className="flex items-center gap-4 w-full min-h-[52px] max-h-[52px] border-b-2 border-border-subtle shrink-0 sticky top-0 bg-surface z-10">
          <div className={`flex flex-[1.25_1_0] items-center gap-4 min-h-[52px] max-h-[52px] ${ROW_PADDING} min-w-0 ${COL.patient}`}>
            <span className="tp-body-04 text-text-secondary truncate">
              Patient
            </span>
          </div>
          <div className={`flex flex-1 items-center gap-4 min-h-[52px] max-h-[52px] ${ROW_PADDING} min-w-0 ${COL.dob}`}>
            <span className="tp-body-04 text-text-secondary truncate">
              Date of birth
            </span>
          </div>
          <div className={`flex flex-1 items-center gap-4 min-h-[52px] max-h-[52px] ${ROW_PADDING} min-w-0 ${COL.lastScan}`}>
            <span className="tp-body-04 text-text-secondary truncate">
              Last Scan Date
            </span>
            {showSortIndicator && (
              <CaretDownIcon size={24} color="var(--color-icon-secondary)" />
            )}
          </div>
          <div className={`flex flex-1 items-center gap-4 min-h-[52px] max-h-[52px] ${ROW_PADDING} min-w-0 ${COL.doctor}`}>
            <span className="tp-body-04 text-text-secondary truncate">
              Doctor
            </span>
          </div>
          <div className={`flex flex-1 items-center justify-center min-h-[52px] max-h-[52px] ${ROW_PADDING} min-w-0 ${COL.orders}`}>
            <span className="tp-body-04 text-text-secondary truncate text-left block w-full">
              Orders
            </span>
          </div>
        </div>

        {/* Table Body */}
        {patients.length === 0 ? (
          <div className="flex items-center w-full">
            <div className={`flex flex-1 items-center justify-center gap-4 h-[72px] min-h-[72px] max-h-[72px] ${ROW_PADDING}`}>
              <p className="tp-body-04 text-text-secondary text-center">
                No result for search &ldquo;{searchQuery}&rdquo; .
              </p>
            </div>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              role="button"
              tabIndex={0}
              className="flex items-center gap-4 w-full border-b border-border-subtle cursor-pointer hover:bg-surface-alt/50 transition-ui shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]"
              onClick={() => onPatientClick?.(patient)}
              onKeyDown={(e) => e.key === "Enter" && onPatientClick?.(patient)}
            >
              <div className={`flex flex-[1.25_1_0] items-center gap-4 h-[72px] min-h-[72px] max-h-[72px] ${ROW_PADDING} min-w-0 ${COL.patient}`}>
                <Avatar
                  firstName={patient.firstName}
                  lastName={patient.lastName}
                  imageUrl={patient.avatarUrl}
                  size={36}
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="tp-body-04 text-text-primary truncate">
                    {patient.firstName} {patient.lastName}
                  </span>
                  <span className="tp-body-04 text-text-secondary truncate">
                    {patient.patientId}
                  </span>
                </div>
              </div>

              <div className={`flex flex-1 items-center h-[72px] min-h-[72px] max-h-[72px] ${ROW_PADDING} min-w-0 ${COL.dob}`}>
<span className="tp-body-04 text-text-primary truncate">
                {patient.dateOfBirth}
                </span>
              </div>

              <div className={`flex flex-1 items-center h-[72px] min-h-[72px] max-h-[72px] ${ROW_PADDING} min-w-0 ${COL.lastScan}`}>
                <span className="tp-body-04 text-text-primary truncate">
                  {patient.lastScanDate}
                </span>
              </div>

              <div className={`flex flex-1 items-center h-[72px] min-h-[72px] max-h-[72px] ${ROW_PADDING} min-w-0 ${COL.doctor}`}>
                <span className="tp-body-04 text-text-primary truncate">
                  {patient.doctor}
                </span>
              </div>

              <div className={`flex flex-1 items-center justify-center h-[72px] min-h-[72px] max-h-[72px] ${ROW_PADDING} min-w-0 ${COL.orders}`}>
                <span className="tp-body-04 text-text-primary truncate text-left block w-full">
                  {patient.orders}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
