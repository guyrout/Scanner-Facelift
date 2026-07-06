/**
 * Scanning flow page — Figma 4118:169146.
 * Header (Home + Info, wizard tabs, actions) + Patient header (avatar, details, edit) + content.
 *
 * Step transitions use a keyed wrapper that triggers a cross-fade animation
 * (animate-step-enter) each time the wizard step changes.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import ScanFlowHeader, { type ScanWizardStep } from "./ScanFlowHeader";
import ScanFlowPatientHeader from "./ScanFlowPatientHeader";
import EditPatientDetailsPanel from "./EditPatientDetailsPanel";
import ProcedureTypeSelector, { type ProcedureType } from "./ProcedureTypeSelector";
import FixedRestorativeForm, { type ToothDetail, type ToggleState } from "./FixedRestorativeForm";
import ScanStepContent from "./ScanStepContent";
import ViewStepContent from "./ViewStepContent";
import SendStepContent from "./SendStepContent";
import ScreenshotSnapshotOverlay, { type ScreenshotPhase } from "./ScreenshotSnapshotOverlay";
import { captureScanFlowScreenshot } from "../utils/captureScanFlowScreenshot";
import type { JawSelection } from "./26A/JawSelector26A";
import type { CameraState } from "./PlyModelViewer";
import type { Patient } from "../data/patients";
import type { Order, OrderDetails } from "../data/orders";
import {
  addRuntimeOrder,
  addRuntimePatient,
  findPatientById,
  generateChartNumber,
  generateOrderId,
  generatePatientId,
} from "../data/runtimeStore";

export interface ScanFlowPatientSnapshot {
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  lastScan: string;
  treatedBy: string;
  /** Internal `Patient.id` when the user picked an existing patient from
   *  the search modal. Absent for a brand-new patient typed in the Info step. */
  internalId?: string;
}

export interface ScanFlowPageProps {
  onBack: () => void;
  onOpenSettings?: () => void;
  onOpenSupport?: () => void;
  /** Patient captured on the pre-wizard “Patient details” screen (Home → Scan). */
  initialPatient?: ScanFlowPatientSnapshot;
  /** Fired after Send and view. Receives the resolved `Patient` so the host
   *  can navigate to that patient's orders page. If omitted, falls back to `onBack`. */
  onScanComplete?: (patient: Patient) => void;
}

const DEFAULT_PATIENT: ScanFlowPatientSnapshot = {
  patientName: "Mina Young",
  patientId: "14129123",
  dateOfBirth: "09/20/2000",
  gender: "Female",
  lastScan: "Jan 15, 2025",
  treatedBy: "Doctor Name | 12367854",
};

function todayMDYYYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function formatIsoDueDate(d: Date | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function procedureLabelFor(treatmentId: string): string {
  switch (treatmentId) {
    case "fixed-restorative":
      return "Fixed Restorative";
    case "denture":
    case "denture-removable":
      return "Denture/Removable";
    case "invisalign":
      return "Invisalign";
    case "study-model":
    default:
      return "Study Model/iRecord";
  }
}

function buildOrderToggles(toggles: ToggleState): OrderDetails["toggles"] {
  return {
    niri: toggles.niri,
    sleeve: toggles.sleeve,
    multiBite: toggles.multiBite,
    preTreatment: toggles.preTreatment,
    palatalGingivalFeedback: false,
    orthoModelICast: false,
  };
}

function buildPatientFromSnapshot(snapshot: ScanFlowPatientSnapshot): Patient {
  const trimmedName = snapshot.patientName.trim();
  const [firstName, ...rest] = trimmedName.length > 0 ? trimmedName.split(/\s+/) : ["New", "Patient"];
  const lastName = rest.join(" ") || "Patient";
  const gender: "Male" | "Female" = snapshot.gender === "Female" ? "Female" : "Male";
  return {
    id: generatePatientId(),
    firstName: firstName || "New",
    lastName,
    patientId: snapshot.patientId.trim() || generateChartNumber(),
    dateOfBirth: snapshot.dateOfBirth || "",
    lastScanDate: todayMDYYYY(),
    doctor: snapshot.treatedBy || "Dr. Mitra Malini",
    orders: 1,
    gender,
  };
}

export default function ScanFlowPage({ onBack, onOpenSettings, onOpenSupport, initialPatient, onScanComplete }: ScanFlowPageProps) {
  const scanFlowRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<ScanWizardStep>("info");
  const previousStepRef = useRef<ScanWizardStep>("info");
  const hasEnteredScanRef = useRef(false);
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureType | null>(null);
  const [showProcedureForm, setShowProcedureForm] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [patient, setPatient] = useState<ScanFlowPatientSnapshot>(() => initialPatient ?? DEFAULT_PATIENT);
  const [screenshotCapture, setScreenshotCapture] = useState<{
    imageUrl: string;
    phase: ScreenshotPhase;
  } | null>(null);
  const screenshotBusyRef = useRef(false);

  const cameraStateRef = useRef<CameraState>({
    radius: 4, phi: Math.PI / 2.2, theta: 0,
    targetX: 0, targetY: 0, targetZ: 0,
  });

  const [selectedJaw, setSelectedJaw] = useState<JawSelection>("upper");

  const handleStepChange = useCallback((step: ScanWizardStep) => {
    if (step === "scan" && currentStep !== "scan" && !hasEnteredScanRef.current) {
      hasEnteredScanRef.current = true;
      setSelectedJaw("lower");
    }
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
    setShowProcedureForm(procedure === "fixed-restorative");
  }

  const handleCameraClick = useCallback(async () => {
    if (screenshotBusyRef.current) return;
    const root = scanFlowRef.current;
    if (!root) return;

    screenshotBusyRef.current = true;
    try {
      const imageUrl = await captureScanFlowScreenshot(root);
      setScreenshotCapture({ imageUrl, phase: "flash" });
    } catch {
      screenshotBusyRef.current = false;
    }
  }, []);

  const handleScreenshotPhaseChange = useCallback((phase: ScreenshotPhase) => {
    setScreenshotCapture((current) => (current ? { ...current, phase } : current));
  }, []);

  const handleScreenshotDismiss = useCallback(() => {
    setScreenshotCapture(null);
    screenshotBusyRef.current = false;
  }, []);

  useEffect(() => {
    if (screenshotCapture?.phase === "thumbnail" || screenshotCapture?.phase === "message") {
      screenshotBusyRef.current = false;
    }
  }, [screenshotCapture?.phase]);

  useEffect(() => {
    setScreenshotCapture(null);
    screenshotBusyRef.current = false;
  }, [currentStep]);

  const handleConfirmSend = useCallback(() => {
    let resolvedPatient: Patient | undefined = patient.internalId
      ? findPatientById(patient.internalId)
      : undefined;

    if (!resolvedPatient) {
      resolvedPatient = buildPatientFromSnapshot(patient);
      addRuntimePatient(resolvedPatient);
    }

    const orderDetails: OrderDetails = {
      treatmentId,
      sendToId,
      dueDate: formatIsoDueDate(dueDate),
      toothSelections,
      toothDetails,
      toggles: buildOrderToggles(toggles),
      noteText,
    };

    const newOrder: Order = {
      orderId: generateOrderId(),
      procedure: procedureLabelFor(treatmentId),
      niri: toggles.niri,
      scanDate: todayMDYYYY(),
      lastModified: todayMDYYYY(),
      status: "sent_to_lab",
      details: orderDetails,
    };
    addRuntimeOrder(resolvedPatient.id, newOrder);

    if (onScanComplete) {
      onScanComplete(resolvedPatient);
    } else {
      onBack();
    }
  }, [
    patient,
    treatmentId,
    sendToId,
    dueDate,
    toothSelections,
    toothDetails,
    toggles,
    noteText,
    onScanComplete,
    onBack,
  ]);

  return (
    <div
      ref={scanFlowRef}
      className="scan-flow flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--color-background-layer-01)]"
    >
      <div className={editPatientOpen ? "relative z-[10000]" : undefined}>
        <ScanFlowHeader
          currentStep={currentStep}
          onStepClick={handleStepChange}
          onInfoClick={onBack}
          onHelpClick={onOpenSupport}
          onSettingsClick={onOpenSettings}
          onCameraClick={handleCameraClick}
        />
      </div>

      {/* Keyed wrapper: React unmounts/remounts on step change → triggers fade-in */}
      <div key={currentStep} ref={stepContentRef} className="animate-step-enter flex flex-col flex-1 min-h-0 min-w-0">
        {currentStep === "info" && (
          <>
            <div className={editPatientOpen ? "relative z-[10000]" : undefined}>
              <ScanFlowPatientHeader
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
            <div className="flex-1 min-h-0 min-w-0 scrollbar-overlay-y bg-[var(--color-page-background)]">
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
                    treatedBy={patient.treatedBy}
                    onTreatmentChange={(id) => handleProcedureSelect(id as ProcedureType)}
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
            selectedProcedure={selectedProcedure}
            toothSelections={toothSelections}
            selectedJaw={selectedJaw}
            onSelectedJawChange={setSelectedJaw}
          />
        )}
        {currentStep === "view" && (
          <ViewStepContent
            toolbarExpanded={toolbarExpanded}
            onToolbarExpandedChange={setToolbarExpanded}
            cameraStateRef={cameraStateRef}
            comingFromScan={previousStepRef.current === "scan"}
            selectedProcedure={selectedProcedure}
            selectedJaw={selectedJaw}
          />
        )}
        {currentStep === "send" && (
          <>
            <div className={editPatientOpen ? "relative z-[10000]" : undefined}>
              <ScanFlowPatientHeader
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
              onSendAndView={handleConfirmSend}
            />
          </>
        )}
      </div>

      <EditPatientDetailsPanel
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

      {screenshotCapture && (
        <ScreenshotSnapshotOverlay
          imageUrl={screenshotCapture.imageUrl}
          phase={screenshotCapture.phase}
          onPhaseChange={handleScreenshotPhaseChange}
          onDismiss={handleScreenshotDismiss}
          anchorRef={stepContentRef}
        />
      )}
    </div>
  );
}
