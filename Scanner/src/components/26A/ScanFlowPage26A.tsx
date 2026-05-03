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
import SleeveConfirmationModal26A from "./SleeveConfirmationModal26A";
import { scanUpperJawGuidanceIsPermanentlySkipped } from "./ScanUpperJawGuidanceModal26A";
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
  const [sleeveModalOpen, setSleeveModalOpen] = useState(false);
  /** User acknowledged sleeve this visit to Scan — resets when the scan flow page unmounts (e.g. Home). */
  const [sleeveAcknowledgedThisFlow, setSleeveAcknowledgedThisFlow] = useState(false);
  /** User closed upper-jaw guidance this visit — same lifetime as `sleeveAcknowledgedThisFlow`. */
  const [upperJawGuidanceDismissedThisFlow, setUpperJawGuidanceDismissedThisFlow] = useState(false);
  /** User closed lower-jaw guidance this visit. */
  const [lowerJawGuidanceDismissedThisFlow, setLowerJawGuidanceDismissedThisFlow] = useState(false);
  const [biteGuidanceDismissedThisFlow, setBiteGuidanceDismissedThisFlow] = useState(false);
  /** Bumped when the sleeve modal closes (or sleeve skipped) so scan-step can open upper-jaw guidance once. */
  const [postSleeveUpperGuidanceNonce, setPostSleeveUpperGuidanceNonce] = useState(0);
  const previousStepRef = useRef<ScanWizardStep>("info");
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [patient, setPatient] = useState<ScanFlowPatientSnapshot>(() => initialPatient ?? DEFAULT_PATIENT);

  const cameraStateRef = useRef<CameraState>({
    radius: 4, phi: Math.PI / 2.2, theta: 0,
    targetX: 0, targetY: 0, targetZ: 0,
  });
  const [selectedJaw, setSelectedJaw] = useState<JawSelection>("upper");

  const handleStepChange = useCallback(
    (step: ScanWizardStep) => {
      if (step === "scan" && currentStep !== "scan") {
        previousStepRef.current = currentStep;
        setCurrentStep("scan");
        if (!sleeveAcknowledgedThisFlow) {
          setSleeveModalOpen(true);
        } else if (!upperJawGuidanceDismissedThisFlow && !scanUpperJawGuidanceIsPermanentlySkipped()) {
          setPostSleeveUpperGuidanceNonce((n) => n + 1);
        }
        return;
      }
      previousStepRef.current = currentStep;
      setCurrentStep(step);
    },
    [currentStep, sleeveAcknowledgedThisFlow, upperJawGuidanceDismissedThisFlow],
  );

  const closeSleeveModal = useCallback(() => {
    setSleeveAcknowledgedThisFlow(true);
    setSleeveModalOpen(false);
    if (!upperJawGuidanceDismissedThisFlow && !scanUpperJawGuidanceIsPermanentlySkipped()) {
      setPostSleeveUpperGuidanceNonce((n) => n + 1);
    }
  }, [upperJawGuidanceDismissedThisFlow]);

  useEffect(() => {
    if (currentStep !== "scan") setSleeveModalOpen(false);
  }, [currentStep]);

  const [treatmentId, setTreatmentId] = useState("fixed-restorative");
  const [sendToId, setSendToId] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [toothSelections, setToothSelections] = useState<Record<number, string>>({});
  const [toothDetails, setToothDetails] = useState<Record<number, ToothDetail>>({});
  const [toggles, setToggles] = useState<ToggleState>({
    niri: true,
    sleeve: true,
    palatalGingivalFeedback: true,
    multiBite: false,
    preTreatment: false,
    orthoModelICast: false,
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

  /**
   * Scan step: show 3D once the sleeve step is confirmed. Guidance modals (upper/lower/bite)
   * render above the viewport (high z-index); we no longer wait for upper-jaw hint dismiss,
   * which left the main area blank if that flow didn’t complete as expected.
   */
  const scanViewport3dReady = sleeveAcknowledgedThisFlow;

  return (
    <div className="scan-flow flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--color-background-layer-01)]">
      <ScanFlowHeader26A
        currentStep={currentStep}
        onStepClick={handleStepChange}
        onInfoClick={onBack}
        onSettingsClick={onOpenSettings}
      />

      {/* Keyed wrapper: React unmounts/remounts on step change → triggers fade-in */}
      {/* overflow-hidden: required so flex child (info scroll area) gets a bounded height; otherwise it grows with content and touch/overflow scroll never activates */}
      <div key={currentStep} className="animate-step-enter flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
            postSleeveUpperGuidanceNonce={postSleeveUpperGuidanceNonce}
            upperJawGuidanceDismissedThisFlow={upperJawGuidanceDismissedThisFlow}
            onUpperJawGuidanceDismissed={() => setUpperJawGuidanceDismissedThisFlow(true)}
            lowerJawGuidanceDismissedThisFlow={lowerJawGuidanceDismissedThisFlow}
            onLowerJawGuidanceDismissed={() => setLowerJawGuidanceDismissedThisFlow(true)}
            biteGuidanceDismissedThisFlow={biteGuidanceDismissedThisFlow}
            onBiteGuidanceDismissed={() => setBiteGuidanceDismissedThisFlow(true)}
            showScanViewport3d={scanViewport3dReady}
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
            upperJawGuidanceDismissedThisFlow={upperJawGuidanceDismissedThisFlow}
            onUpperJawGuidanceDismissed={() => setUpperJawGuidanceDismissedThisFlow(true)}
            lowerJawGuidanceDismissedThisFlow={lowerJawGuidanceDismissedThisFlow}
            onLowerJawGuidanceDismissed={() => setLowerJawGuidanceDismissedThisFlow(true)}
            biteGuidanceDismissedThisFlow={biteGuidanceDismissedThisFlow}
            onBiteGuidanceDismissed={() => setBiteGuidanceDismissedThisFlow(true)}
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
            onConfirmSend={onBack}
            upperJawGuidanceDismissedThisFlow={upperJawGuidanceDismissedThisFlow}
            onUpperJawGuidanceDismissed={() => setUpperJawGuidanceDismissedThisFlow(true)}
            lowerJawGuidanceDismissedThisFlow={lowerJawGuidanceDismissedThisFlow}
            onLowerJawGuidanceDismissed={() => setLowerJawGuidanceDismissedThisFlow(true)}
            biteGuidanceDismissedThisFlow={biteGuidanceDismissedThisFlow}
            onBiteGuidanceDismissed={() => setBiteGuidanceDismissedThisFlow(true)}
          />
        )}
      </div>

      <SleeveConfirmationModal26A
        open={sleeveModalOpen}
        onConfirm={closeSleeveModal}
        onRequestClose={closeSleeveModal}
      />
    </div>
  );
}
