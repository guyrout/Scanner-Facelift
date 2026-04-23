/**
 * Scanning flow page — Figma 4118:169146.
 * Header (Home + Info, wizard tabs, actions) + content.
 *
 * Step transitions use a keyed wrapper that triggers a cross-fade animation
 * (animate-step-enter) each time the wizard step changes.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import ScanFlowHeader26A, { type ScanWizardStep } from "./ScanFlowHeader26A";
import InfoStepContent26A from "./InfoStepContent26A";
import { type ToothDetail, type ToggleState, UPPER_TEETH, LOWER_TEETH } from "./FixedRestorativeForm26A";
import ScanStepContent26A from "./ScanStepContent26A";
import ViewStepContent26A from "./ViewStepContent26A";
import SendStepContent26A from "./SendStepContent26A";
import type { CameraState } from "./PlyModelViewer26A";
import type { JawSelection } from "./JawSelector26A";

export interface ScanFlowPatientSnapshot {
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  lastScan: string;
  treatedBy: string;
}

export interface ScanFlowPageProps {
  onBack: () => void;
  onOpenSettings?: () => void;
  /** Patient captured on the pre-wizard “Patient details” screen (Home → Scan). */
  initialPatient?: ScanFlowPatientSnapshot;
}

const DEFAULT_PATIENT: ScanFlowPatientSnapshot = {
  patientName: "",
  patientId: "",
  dateOfBirth: "",
  gender: "",
  lastScan: "",
  treatedBy: "",
};

export default function ScanFlowPage26A({ onBack, onOpenSettings, initialPatient }: ScanFlowPageProps) {
  const [currentStep, setCurrentStep] = useState<ScanWizardStep>("info");
  const previousStepRef = useRef<ScanWizardStep>("info");
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [patient, setPatient] = useState<ScanFlowPatientSnapshot>(() => initialPatient ?? DEFAULT_PATIENT);

  const cameraStateRef = useRef<CameraState>({
    radius: 4, phi: Math.PI / 2.2, theta: 0,
    targetX: 0, targetY: 0, targetZ: 0,
  });
  const [selectedJaw, setSelectedJaw] = useState<JawSelection>("upper");

  const handleStepChange = useCallback((step: ScanWizardStep) => {
    previousStepRef.current = currentStep;
    setCurrentStep(step);
  }, [currentStep]);

  const [treatmentId, setTreatmentId] = useState("fixed-restorative");
  const [sendToId, setSendToId] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [toothSelections, setToothSelections] = useState<Record<number, string>>({});
  const [toothDetails, setToothDetails] = useState<Record<number, ToothDetail>>({});
  const [toggles, setToggles] = useState<ToggleState>({
    niri: true,
    sleeve: true,
    multiBite: false,
    preTreatment: false,
  });
  const [noteText, setNoteText] = useState("");

  const prevToothSelectionsRef = useRef<Record<number, string>>(toothSelections);
  useEffect(() => {
    const prev = prevToothSelectionsRef.current;
    const keys = new Set([...Object.keys(prev), ...Object.keys(toothSelections)]);
    let changedTooth: number | null = null;
    for (const k of keys) {
      const n = Number(k);
      if (Number.isNaN(n)) continue;
      if (prev[n] !== toothSelections[n]) {
        changedTooth = n;
        break;
      }
    }
    prevToothSelectionsRef.current = { ...toothSelections };
    if (changedTooth == null) return;
    if (UPPER_TEETH.includes(changedTooth)) {
      setSelectedJaw("upper");
    } else if (LOWER_TEETH.includes(changedTooth)) {
      setSelectedJaw("lower");
    }
  }, [toothSelections]);

  return (
    <div className="scan-flow flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--color-background-layer-01)]">
      <ScanFlowHeader26A
        currentStep={currentStep}
        onStepClick={handleStepChange}
        onInfoClick={onBack}
        onSettingsClick={onOpenSettings}
      />

      {/* Keyed wrapper: React unmounts/remounts on step change → triggers fade-in */}
      <div key={currentStep} className="animate-step-enter flex flex-col flex-1 min-h-0 min-w-0">
        {currentStep === "info" && (
          <InfoStepContent26A
            patient={patient}
            onPatientChange={setPatient}
            treatmentId={treatmentId}
            setTreatmentId={setTreatmentId}
            sendToId={sendToId}
            setSendToId={setSendToId}
            dueDate={dueDate}
            setDueDate={setDueDate}
            toothSelections={toothSelections}
            setToothSelections={setToothSelections}
            toothDetails={toothDetails}
            setToothDetails={setToothDetails}
            toggles={toggles}
            setToggles={setToggles}
            noteText={noteText}
            setNoteText={setNoteText}
          />
        )}
        {currentStep === "scan" && (
          <ScanStepContent26A
            toolbarExpanded={toolbarExpanded}
            onToolbarExpandedChange={setToolbarExpanded}
            cameraStateRef={cameraStateRef}
            treatmentId={treatmentId}
            toothSelections={toothSelections}
            selectedJaw={selectedJaw}
            onSelectedJawChange={setSelectedJaw}
          />
        )}
        {currentStep === "view" && (
          <ViewStepContent26A
            toolbarExpanded={toolbarExpanded}
            onToolbarExpandedChange={setToolbarExpanded}
            cameraStateRef={cameraStateRef}
            comingFromScan={previousStepRef.current === "scan"}
            treatmentId={treatmentId}
            toothSelections={toothSelections}
            selectedJaw={selectedJaw}
            onSelectedJawChange={setSelectedJaw}
          />
        )}
        {currentStep === "send" && (
          <SendStepContent26A
            treatmentId={treatmentId}
            setTreatmentId={setTreatmentId}
            sendToId={sendToId}
            setSendToId={setSendToId}
            dueDate={dueDate}
            setDueDate={setDueDate}
            toothSelections={toothSelections}
            setToothSelections={setToothSelections}
            toothDetails={toothDetails}
            toggles={toggles}
            noteText={noteText}
            setNoteText={setNoteText}
            toolbarExpanded={toolbarExpanded}
            onToolbarExpandedChange={setToolbarExpanded}
            cameraStateRef={cameraStateRef}
            comingFromScan={previousStepRef.current === "scan"}
            selectedJaw={selectedJaw}
            onSelectedJawChange={setSelectedJaw}
            onExitSend={() => handleStepChange("view")}
          />
        )}
      </div>

    </div>
  );
}
