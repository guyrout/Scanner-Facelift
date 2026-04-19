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
  /** Close control on the sign modal — e.g. return to View step */
  onExitSend?: () => void;
}

export default function SendStepContent26A(props: SendStepContentProps) {
  const {
    sendToId,
    toolbarExpanded,
    onToolbarExpandedChange,
    cameraStateRef,
    comingFromScan = false,
    onExitSend,
  } = props;

  const handleConfirmSend = () => {
    // Wire to submission / navigation when backend flow exists
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex flex-col min-h-0">
        <ViewStepContent26A
          toolbarExpanded={toolbarExpanded}
          onToolbarExpandedChange={onToolbarExpandedChange}
          cameraStateRef={cameraStateRef}
          comingFromScan={comingFromScan}
        />
      </div>
      <SignCaseModal26A sendToId={sendToId} onConfirmSend={handleConfirmSend} onRequestClose={onExitSend} />
    </div>
  );
}
