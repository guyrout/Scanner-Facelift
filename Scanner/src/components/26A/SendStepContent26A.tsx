/**
 * Send step (26A) — View page with Sign case overlay (Figma 6172:8673).
 * Full-width 3D view with centered modal: signature, options, Confirm & Send.
 *
 * Parent retains treatment / teeth / note state for submission flows; this step
 * focuses on sign-off over the live view.
 */

import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import ViewStepContent26A from "./ViewStepContent26A";
import SignCaseModal26A from "./SignCaseModal26A";
import type { ToothDetail, ToggleState } from "./FixedRestorativeForm26A";
import type { CameraState } from "./PlyModelViewer26A";
import type { JawSelection } from "./JawSelector26A";

export interface SendStepContentProps {
  treatmentId: string;
  setTreatmentId: Dispatch<SetStateAction<string>>;
  sendToId: string;
  setSendToId: Dispatch<SetStateAction<string>>;
  dueDate: Date | null;
  setDueDate: Dispatch<SetStateAction<Date | null>>;
  toothSelections: Record<number, string>;
  setToothSelections: Dispatch<SetStateAction<Record<number, string>>>;
  toothDetails: Record<number, ToothDetail>;
  toggles: ToggleState;
  noteText: string;
  setNoteText: Dispatch<SetStateAction<string>>;
  toolbarExpanded?: boolean;
  onToolbarExpandedChange?: (expanded: boolean) => void;
  cameraStateRef?: MutableRefObject<CameraState>;
  comingFromScan?: boolean;
  selectedJaw: JawSelection;
  onSelectedJawChange: (jaw: JawSelection) => void;
  /** Close control on the sign modal — e.g. return to View step */
  onExitSend?: () => void;
  /** Confirm action on sign modal — e.g. return to Home page */
  onConfirmSend?: () => void;
  upperJawGuidanceDismissedThisFlow?: boolean;
  onUpperJawGuidanceDismissed?: () => void;
  lowerJawGuidanceDismissedThisFlow?: boolean;
  onLowerJawGuidanceDismissed?: () => void;
  biteGuidanceDismissedThisFlow?: boolean;
  onBiteGuidanceDismissed?: () => void;
}

export default function SendStepContent26A(props: SendStepContentProps) {
  const {
    treatmentId,
    toothSelections,
    sendToId,
    toolbarExpanded,
    onToolbarExpandedChange,
    cameraStateRef,
    comingFromScan = false,
    selectedJaw,
    onSelectedJawChange,
    onExitSend,
    onConfirmSend,
    upperJawGuidanceDismissedThisFlow,
    onUpperJawGuidanceDismissed,
    lowerJawGuidanceDismissedThisFlow,
    onLowerJawGuidanceDismissed,
    biteGuidanceDismissedThisFlow,
    onBiteGuidanceDismissed,
  } = props;

  const handleConfirmSend = () => {
    onConfirmSend?.();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex flex-col min-h-0">
        <ViewStepContent26A
          toolbarExpanded={toolbarExpanded}
          onToolbarExpandedChange={onToolbarExpandedChange}
          cameraStateRef={cameraStateRef}
          comingFromScan={comingFromScan}
          treatmentId={treatmentId}
          toothSelections={toothSelections}
          selectedJaw={selectedJaw}
          onSelectedJawChange={onSelectedJawChange}
          upperJawGuidanceDismissedThisFlow={upperJawGuidanceDismissedThisFlow}
          onUpperJawGuidanceDismissed={onUpperJawGuidanceDismissed}
          lowerJawGuidanceDismissedThisFlow={lowerJawGuidanceDismissedThisFlow}
          onLowerJawGuidanceDismissed={onLowerJawGuidanceDismissed}
          biteGuidanceDismissedThisFlow={biteGuidanceDismissedThisFlow}
          onBiteGuidanceDismissed={onBiteGuidanceDismissed}
        />
      </div>
      <SignCaseModal26A sendToId={sendToId} onConfirmSend={handleConfirmSend} onRequestClose={onExitSend} />
    </div>
  );
}
