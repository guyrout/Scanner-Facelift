/**
 * Scanning flow page — Figma 4118:169146.
 * Header (Home + Info, wizard tabs, actions) + Patient header (avatar, details, edit) + content.
 *
 * Step transitions use a keyed wrapper that triggers a cross-fade animation
 * (animate-step-enter) each time the wizard step changes.
 */

import { useState, useRef, useCallback } from "react";
import ScanFlowHeader, { type ScanWizardStep } from "./ScanFlowHeader";
import ScanFlowPatientHeader from "./ScanFlowPatientHeader";
import ProcedureTypeSelector, { type ProcedureType } from "./ProcedureTypeSelector";
import FixedRestorativeForm, { type ToothDetail, type ToggleState } from "./FixedRestorativeForm";
import ScanStepContent from "./ScanStepContent";
import ViewStepContent from "./ViewStepContent";
import SendStepContent from "./SendStepContent";
import type { CameraState } from "./PlyModelViewer";

export interface ScanFlowPageProps {
  onBack: () => void;
  onOpenSettings?: () => void;
}

const PLACEHOLDER_PATIENT = {
  patientName: "Mina Young",
  patientId: "14129123",
  dateOfBirth: "09/20/2000",
  gender: "Female",
  lastScan: "Jan 15, 2025",
  treatedBy: "Doctor Name | 12367854",
};

export default function ScanFlowPage({ onBack, onOpenSettings }: ScanFlowPageProps) {
  const [currentStep, setCurrentStep] = useState<ScanWizardStep>("info");
  const previousStepRef = useRef<ScanWizardStep>("info");
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureType | null>(null);
  const [showProcedureForm, setShowProcedureForm] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);

  const cameraStateRef = useRef<CameraState>({
    radius: 4, phi: Math.PI / 2.2, theta: 0,
    targetX: 0, targetY: 0, targetZ: 0,
  });

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

  function handleProcedureSelect(procedure: ProcedureType) {
    setSelectedProcedure(procedure);
    setTreatmentId(procedure);
    if (procedure === "fixed-restorative") {
      setShowProcedureForm(true);
    }
  }

  return (
    <div className="scan-flow flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--color-background-layer-01)]">
      <ScanFlowHeader
        currentStep={currentStep}
        onStepClick={handleStepChange}
        onInfoClick={onBack}
        onSettingsClick={onOpenSettings}
      />

      {/* Keyed wrapper: React unmounts/remounts on step change → triggers fade-in */}
      <div key={currentStep} className="animate-step-enter flex flex-col flex-1 min-h-0 min-w-0">
        {currentStep === "info" && (
          <>
            <ScanFlowPatientHeader
              patientName={PLACEHOLDER_PATIENT.patientName}
              patientId={PLACEHOLDER_PATIENT.patientId}
              dateOfBirth={PLACEHOLDER_PATIENT.dateOfBirth}
              gender={PLACEHOLDER_PATIENT.gender}
              lastScan={PLACEHOLDER_PATIENT.lastScan}
              treatedBy={PLACEHOLDER_PATIENT.treatedBy}
              onEditClick={() => {}}
            />
            <div className="flex-1 min-h-0 min-w-0 overflow-auto scrollbar-hidden bg-[var(--color-page-background)]">
              <div className="flex flex-col" style={{ padding: 16, minHeight: "100%" }}>
                {showProcedureForm && selectedProcedure === "fixed-restorative" ? (
                  <FixedRestorativeForm
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
                ) : (
                  <ProcedureTypeSelector
                    selected={selectedProcedure ?? undefined}
                    onSelect={handleProcedureSelect}
                  />
                )}
              </div>
            </div>
          </>
        )}
        {currentStep === "scan" && (
          <ScanStepContent
            toolbarExpanded={toolbarExpanded}
            onToolbarExpandedChange={setToolbarExpanded}
            cameraStateRef={cameraStateRef}
          />
        )}
        {currentStep === "view" && (
          <ViewStepContent
            toolbarExpanded={toolbarExpanded}
            onToolbarExpandedChange={setToolbarExpanded}
            cameraStateRef={cameraStateRef}
            comingFromScan={previousStepRef.current === "scan"}
          />
        )}
        {currentStep === "send" && (
          <>
            <ScanFlowPatientHeader
              patientName={PLACEHOLDER_PATIENT.patientName}
              patientId={PLACEHOLDER_PATIENT.patientId}
              dateOfBirth={PLACEHOLDER_PATIENT.dateOfBirth}
              gender={PLACEHOLDER_PATIENT.gender}
              lastScan={PLACEHOLDER_PATIENT.lastScan}
              treatedBy={PLACEHOLDER_PATIENT.treatedBy}
              onEditClick={() => {}}
            />
            <SendStepContent
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
            />
          </>
        )}
      </div>
    </div>
  );
}
