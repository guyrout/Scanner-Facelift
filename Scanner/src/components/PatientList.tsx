import { useState, useMemo, useRef } from "react";
import OrdersHeader from "./OrdersHeader";
import SearchInput from "./SearchInput";
import type { SearchInputRef } from "./SearchInput";
import PatientTable from "./PatientTable";
import VirtualKeyboard from "./VirtualKeyboard";
import { patients } from "../data/patients";
import type { Patient } from "../data/patients";

export interface PatientListProps {
  selectedDoctorName?: string | null;
  selectedDentistId?: string;
  onDentistChange?: (id: string) => void;
  onPatientClick?: (patient: Patient) => void;
  onOpenSettings?: () => void;
  onBack?: () => void;
}

export default function PatientList(props: PatientListProps) {
  const { selectedDoctorName, selectedDentistId, onDentistChange, onPatientClick, onOpenSettings, onBack } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<SearchInputRef>(null);

  const filteredPatients = useMemo(() => {
    let list = patients;
    if (selectedDoctorName) {
      list = list.filter((p) => p.doctor === selectedDoctorName);
    }
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
        p.patientId.includes(query)
    );
  }, [searchQuery, selectedDoctorName]);

  const showKeyboard = isSearchFocused;
  const hasSearchValue = searchQuery.length > 0;

  const handleKeyPress = (key: string) => {
    setSearchQuery((prev) => prev + key);
  };

  const handleBackspace = () => {
    setSearchQuery((prev) => prev.slice(0, -1));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const handleCloseKeyboard = () => {
    searchInputRef.current?.blur();
    setIsSearchFocused(false);
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden bg-page-bg relative">
      <OrdersHeader
        title="Patients"
        onHomeClick={onBack ?? (() => {})}
        onSettingsClick={onOpenSettings}
        selectedDentistId={selectedDentistId}
        onDentistChange={onDentistChange}
      />

      {/* Full-width content area; 16px padding at all screen sizes (Figma node 2001-14723) */}
      <div
        className="flex-1 flex flex-col w-full min-w-0 min-h-0"
        style={{ padding: 16 }}
      >
        <div
          className="flex flex-col flex-1 min-h-0 w-full h-full min-w-0 bg-surface rounded-lg overflow-hidden"
          style={{
            boxShadow: "var(--shadow-card)",
            padding: 16,
          }}
        >
          {/* Vertical scroll: title + search + table as one scrollable area */}
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-auto scrollbar-table table-no-select flex flex-col gap-4">
            {/* Section title */}
            <div className="flex items-center shrink-0">
              <h2 className="tp-heading-02 text-text-primary">
                Patients
              </h2>
            </div>

            {/* Toolbar - search on the left for English LTR */}
            <div className="flex items-start justify-start shrink-0 min-h-[44px] max-h-[64px]">
              <SearchInput
                ref={searchInputRef}
                value={searchQuery}
                isFocused={isSearchFocused}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
              />
            </div>

            {/* Table: flows in scroll, no nested scroll */}
            <div className="flex-1 min-w-0 w-full min-h-0 flex flex-col">
              <PatientTable
                patients={filteredPatients}
                searchQuery={searchQuery}
                showSortIndicator={hasSearchValue && filteredPatients.length === 0}
                onPatientClick={onPatientClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Virtual keyboard overlay */}
      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClose={handleCloseKeyboard}
        />
      )}
    </div>
  );
}
