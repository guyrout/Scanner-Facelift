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
import { scanLowerJawGuidanceIsPermanentlySkipped } from "./ScanLowerJawGuidanceModal26A";
import type { CameraState } from "./PlyModelViewer26A";
import type { JawSelection } from "./JawSelector26A";
import type { Patient } from "../../data/patients";
import type { Order, OrderDetails } from "../../data/orders";
import {
  addRuntimeOrder,
  addRuntimePatient,
  findPatientById,
  generateChartNumber,
  generateOrderId,
  generatePatientId,
} from "../../data/runtimeStore";

export interface ScanFlowPatientSnapshot {
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  lastScan: string;
  treatedBy: string;
  /** Internal `Patient.id` when the user picked an existing patient from
   *  the search modal. Absent when the user is creating a new patient
   *  from scratch in the Info step. */
  internalId?: string;
}

export interface ScanFlowPageProps {
  onBack: () => void;
  onOpenSettings?: () => void;
  onOpenSupport?: () => void;
  /** Patient captured on the pre-wizard “Patient details” screen (Home → Scan). */
  initialPatient?: ScanFlowPatientSnapshot;
  /** Optional scan-flow snapshot used to pre-fill the Info step when the
   *  user clicked "Duplicate scan" from a previous order. Covers procedure
   *  type, tooth selections, toggles, due date, send-to, and note. */
  initialOrderDetails?: OrderDetails;
  /** Fired after Confirm & Send. Receives the resolved `Patient` so the
   *  host can navigate to that patient's orders page. If omitted, the host
   *  falls back to `onBack`. */
  onScanComplete?: (patient: Patient) => void;
}

const DEFAULT_PATIENT: ScanFlowPatientSnapshot = {
  patientName: "",
  patientId: "",
  dateOfBirth: "",
  gender: "",
  lastScan: "",
  treatedBy: "",
};

/** MM/DD/YYYY for the current local date. */
function todayMDYYYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

/** Parse an ISO date string ("YYYY-MM-DD") into a local `Date`. Returns
 *  `null` for falsy/invalid input so the date-picker stays unset. */
function parseIsoDueDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [, y, mo, da] = m;
  return new Date(Number(y), Number(mo) - 1, Number(da));
}

/** Format a `Date` back into the ISO "YYYY-MM-DD" used in `OrderDetails`. */
function formatIsoDueDate(d: Date | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/**
 * Decide which jaw guidance to surface after the sleeve modal closes (or when
 * the user re-enters Scan). For Fixed Restorative cases whose only crowns are
 * on lower-arch teeth, the workflow starts on the lower arch — the lower-jaw
 * guidance modal opens and the lower jaw becomes the active highlight. Every
 * other case keeps the historical upper-first behaviour.
 */
function computeFirstCrownJaw(
  toothSelections: Record<number, string>,
  treatmentId: string,
): JawSelection {
  if (treatmentId !== "fixed-restorative") return "upper";
  const hasUpperCrown = UPPER_TEETH.some((t) => toothSelections[t] === "Crown");
  const hasLowerCrown = LOWER_TEETH.some((t) => toothSelections[t] === "Crown");
  if (hasLowerCrown && !hasUpperCrown) return "lower";
  return "upper";
}

/** Map a treatment id to the procedure label used in the Order table. */
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

/** Build a `Patient` record from a free-text Info-step snapshot. Used when
 *  the user typed a brand-new patient (no `internalId` set). */
function buildPatientFromSnapshot(snapshot: ScanFlowPatientSnapshot): Patient {
  const trimmedName = snapshot.patientName.trim();
  const [firstName, ...rest] = trimmedName.length > 0 ? trimmedName.split(/\s+/) : ["New", "Patient"];
  const lastName = rest.join(" ") || "Patient";
  const gender: "Male" | "Female" = snapshot.gender === "Female" ? "Female" : "Male";
  return {
    id: generatePatientId(),
    firstName: firstName || "New",
    lastName,
    // When the user skipped the Chart Number field, mint one for them so
    // the patient row + orders table show a real-looking id (matches the
    // 8-digit seed-data format).
    patientId: snapshot.patientId.trim() || generateChartNumber(),
    dateOfBirth: snapshot.dateOfBirth || "",
    lastScanDate: todayMDYYYY(),
    doctor: snapshot.treatedBy || "Dr. Mitra Malini",
    orders: 1,
    gender,
  };
}

export default function ScanFlowPage26A({
  onBack,
  onOpenSettings,
  onOpenSupport,
  initialPatient,
  initialOrderDetails,
  onScanComplete,
}: ScanFlowPageProps) {
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
  /**
   * Mirror of `postSleeveUpperGuidanceNonce` for the lower-jaw guidance modal.
   * Fixed-restorative cases whose only crowns are on the lower arch start the
   * scan workflow on lower; bumping this nonce opens `ScanLowerJawGuidanceModal26A`.
   */
  const [postSleeveLowerGuidanceNonce, setPostSleeveLowerGuidanceNonce] = useState(0);
  const previousStepRef = useRef<ScanWizardStep>("info");
  const [toolbarExpanded, setToolbarExpanded] = useState(true);
  const [patient, setPatient] = useState<ScanFlowPatientSnapshot>(() => initialPatient ?? DEFAULT_PATIENT);

  const cameraStateRef = useRef<CameraState>({
    radius: 4, phi: Math.PI / 2.2, theta: 0,
    targetX: 0, targetY: 0, targetZ: 0,
  });
  const [selectedJaw, setSelectedJaw] = useState<JawSelection>("upper");

  // Declared early so the post-sleeve guidance routing can derive
  // `firstCrownJaw` from them. Other treatment/order state follows.
  // All of these accept a `initialOrderDetails` seed so "Duplicate scan"
  // can pre-fill the Info step from a previous order.
  const [treatmentId, setTreatmentId] = useState(
    () => initialOrderDetails?.treatmentId ?? "study-model",
  );
  const [toothSelections, setToothSelections] = useState<Record<number, string>>(
    () => initialOrderDetails?.toothSelections ?? {},
  );

  const handleStepChange = useCallback(
    (step: ScanWizardStep) => {
      if (step === "scan" && currentStep !== "scan") {
        previousStepRef.current = currentStep;
        setCurrentStep("scan");
        if (!sleeveAcknowledgedThisFlow) {
          setSleeveModalOpen(true);
        } else {
          triggerPostSleeveGuidance();
        }
        return;
      }
      previousStepRef.current = currentStep;
      setCurrentStep(step);
    },
    // `triggerPostSleeveGuidance` is stable via useCallback below; including it
    // here keeps exhaustive-deps happy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStep, sleeveAcknowledgedThisFlow],
  );

  /**
   * Route the post-sleeve guidance to the lower jaw when the Fixed Restorative
   * case has crowns only on lower-arch teeth; otherwise stay with the existing
   * upper-jaw guidance path.
   */
  const triggerPostSleeveGuidance = useCallback(() => {
    const targetJaw = computeFirstCrownJaw(toothSelections, treatmentId);
    if (targetJaw === "lower") {
      setSelectedJaw("lower");
      if (
        !lowerJawGuidanceDismissedThisFlow &&
        !scanLowerJawGuidanceIsPermanentlySkipped()
      ) {
        setPostSleeveLowerGuidanceNonce((n) => n + 1);
      }
      return;
    }
    if (
      !upperJawGuidanceDismissedThisFlow &&
      !scanUpperJawGuidanceIsPermanentlySkipped()
    ) {
      setPostSleeveUpperGuidanceNonce((n) => n + 1);
    }
  }, [
    toothSelections,
    treatmentId,
    upperJawGuidanceDismissedThisFlow,
    lowerJawGuidanceDismissedThisFlow,
  ]);

  const closeSleeveModal = useCallback(() => {
    setSleeveAcknowledgedThisFlow(true);
    setSleeveModalOpen(false);
    triggerPostSleeveGuidance();
  }, [triggerPostSleeveGuidance]);

  useEffect(() => {
    if (currentStep !== "scan") setSleeveModalOpen(false);
  }, [currentStep]);

  // `treatmentId` and `toothSelections` are declared above (before the
  // post-sleeve callbacks) so the guidance-routing closure can read them.
  const [sendToId, setSendToId] = useState(() => initialOrderDetails?.sendToId ?? "");
  const [dueDate, setDueDate] = useState<Date | null>(
    () => parseIsoDueDate(initialOrderDetails?.dueDate),
  );
  const [toothDetails, setToothDetails] = useState<Record<number, ToothDetail>>(
    () => initialOrderDetails?.toothDetails ?? {},
  );
  const [toggles, setToggles] = useState<ToggleState>(
    () =>
      initialOrderDetails?.toggles ?? {
        niri: true,
        sleeve: true,
        palatalGingivalFeedback: true,
        multiBite: false,
        preTreatment: false,
        orthoModelICast: false,
      },
  );
  const [noteText, setNoteText] = useState(() => initialOrderDetails?.noteText ?? "");

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

  /**
   * Confirm & Send: persist the new order (and a new patient row when needed)
   * into the runtime store, then hand the resolved `Patient` to the host so
   * it can navigate to that patient's orders page.
   */
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
      toggles,
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
    <div className="scan-flow flex flex-col w-full h-full min-h-0 overflow-hidden bg-[var(--color-background-layer-01)]">
      <ScanFlowHeader26A
        currentStep={currentStep}
        onStepClick={handleStepChange}
        onInfoClick={onBack}
        onHelpClick={onOpenSupport}
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
            postSleeveLowerGuidanceNonce={postSleeveLowerGuidanceNonce}
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
            occlusgramTrimMutuallyExclusive
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
            onConfirmSend={handleConfirmSend}
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
