/**
 * Scanning flow page — Figma 4118:169146.
 * Header (Home + Info, wizard tabs, actions) + Patient header (avatar, details, edit) + content.
 *
 * Step transitions use a keyed wrapper that triggers a cross-fade animation
 * (animate-step-enter) each time the wizard step changes.
 */

import { useState, useRef, useCallback } from "react";
import ScanFlowHeader26A, { type ScanWizardStep } from "./ScanFlowHeader26A";
import ScanFlowPatientHeader26A from "./ScanFlowPatientHeader26A";
import EditPatientDetailsPanel26A from "./EditPatientDetailsPanel26A";
import InfoStepContent26A from "./InfoStepContent26A";
import { type ToothDetail, type ToggleState } from "./FixedRestorativeForm26A";
import ScanStepContent26A from "./ScanStepContent26A";
import ViewStepContent26A from "./ViewStepContent26A";
import SendStepContent26A from "./SendStepContent26A";
import type { CameraState } from "./PlyModelViewer26A";

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
  patientName: "Mina Young",
  patientId: "14129123",
  dateOfBirth: "09/20/2000",
  gender: "Female",
  lastScan: "Jan 15, 2025",
  treatedBy: "Doctor Name | 12367854",
};

export default function ScanFlowPage26A({ onBack, onOpenSettings, initialPatient }: ScanFlowPageProps) {
  const [currentStep, setCurrentStep] = useState<ScanWizardStep>("info");
  const previousStepRef = useRef<ScanWizardStep>("info");
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [patient, setPatient] = useState<ScanFlowPatientSnapshot>(() => initialPatient ?? DEFAULT_PATIENT);

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

  return (
    <div className="scan-flow flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--color-background-layer-01)]">
      <div className={editPatientOpen ? "relative z-[10000]" : undefined}>
        <ScanFlowHeader26A
          currentStep={currentStep}
          onStepClick={handleStepChange}
          onInfoClick={onBack}
          onSettingsClick={onOpenSettings}
        />
      </div>

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
          />
        )}
        {currentStep === "view" && (
          <ViewStepContent26A
            toolbarExpanded={toolbarExpanded}
            onToolbarExpandedChange={setToolbarExpanded}
            cameraStateRef={cameraStateRef}
            comingFromScan={previousStepRef.current === "scan"}
          />
        )}
        {currentStep === "send" && (
          <>
            <div className={editPatientOpen ? "relative z-[10000]" : undefined}>
              <ScanFlowPatientHeader26A
                patientName={patient.patientName}
                patientId={patient.patientId}
                dateOfBirth={patient.dateOfBirth}
                gender={patient.gender}
                lastScan={patient.lastScan}
                treatedBy={patient.treatedBy}
                isEditOpen={editPatientOpen}
                onEditClick={() => setEditPatientOpen(true)}
                onCloseEdit={() => setEditPatientOpen(false)}
              />
            </div>
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
            />
          </>
        )}
      </div>

      <EditPatientDetailsPanel26A
        isOpen={editPatientOpen}
        onClose={() => setEditPatientOpen(false)}
        patientName={patient.patientName}
        patientId={patient.patientId}
        dateOfBirth={patient.dateOfBirth}
        gender={patient.gender}
        treatedBy={patient.treatedBy}
        lastScan={patient.lastScan}
        onSave={(data) => setPatient(data)}
      />
    </div>
  );
}
