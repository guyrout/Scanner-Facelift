import { useCallback, useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import OrdersPage from "./components/OrdersPage";
import MessagesPage from "./components/MessagesPage";
import PatientList from "./components/PatientList";
import PatientOrders from "./components/PatientOrders";
import ScanFlowPage, { type ScanFlowPatientSnapshot } from "./components/ScanFlowPage";
import ScanPatientDetailsPage from "./components/ScanPatientDetailsPage";
import ScanFlowPage26A from "./components/26A/ScanFlowPage26A";
import ScanPatientDetailsPage26A from "./components/26A/ScanPatientDetailsPage26A";
import SettingsModal from "./components/SettingsModal";
import SupportModal from "./components/SupportModal";
import { DENTISTS, SHOW_ALL_DRS_ID } from "./components/OrdersHeader";
import type { Patient } from "./data/patients";
import { getScanFlowVersion } from "./utils/scanFlowVersionManager";

const BRIGHTNESS_STORAGE_KEY = "scanner-brightness";
const VOLUME_STORAGE_KEY = "scanner-volume";

function getStoredBrightness(): number {
  try {
    const v = localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
    if (v != null) {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0 && n <= 100) return n;
    }
  } catch {
    /* ignore */
  }
  return 100;
}

function getStoredVolume(): number {
  try {
    const v = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (v != null) {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0 && n <= 100) return n;
    }
  } catch {
    /* ignore */
  }
  return 100;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [showHome, setShowHome] = useState(true);
  const [showOrdersPage, setShowOrdersPage] = useState(false);
  const [showMessagesPage, setShowMessagesPage] = useState(false);
  const [showScanPatientDetails, setShowScanPatientDetails] = useState(false);
  const [showScanFlow, setShowScanFlow] = useState(false);
  const [scanEntryPatient, setScanEntryPatient] = useState<ScanFlowPatientSnapshot | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [settingsInitialView, setSettingsInitialView] = useState<"main" | "scan">("main");
  const [brightness, setBrightness] = useState(getStoredBrightness);
  const [volume, setVolume] = useState(getStoredVolume);
  const [selectedDentistId, setSelectedDentistId] = useState<string>(SHOW_ALL_DRS_ID);
  
  // Track version as state so render branches stay in sync when the user switches.
  const [scanFlowVersion, setScanFlowVersionState] = useState(() => getScanFlowVersion());

  // Re-read the version from localStorage at the moment Scan is clicked.
  const getCurrentVersion = useCallback(() => {
    const v = getScanFlowVersion();
    setScanFlowVersionState(v);
    return v;
  }, []);

  const openSettings = (view?: "main" | "scan") => {
    setSettingsInitialView(view ?? "main");
    setShowSettings(true);
  };

  const openSupport = useCallback(() => setSupportModalOpen(true), []);

  const selectedDoctorName =
    selectedDentistId === SHOW_ALL_DRS_ID ? null : DENTISTS.find((d) => d.id === selectedDentistId)?.name ?? null;

  useEffect(() => {
    try {
      localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(brightness));
    } catch {
      /* ignore */
    }
  }, [brightness]);

  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      /* ignore */
    }
  }, [volume]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div
        className="flex flex-col h-full min-h-0 w-full overflow-hidden"
        style={{ filter: `brightness(${brightness / 100})` }}
      >
        {showLogin ? (
          <div key="login" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <LoginPage
              onLogin={() => setShowLogin(false)}
              onOpenSettings={() => openSettings()}
              onOpenSupport={openSupport}
            />
          </div>
        ) : showHome ? (
          <div key="home" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <HomePage
              onPatientListClick={() => {
                setShowHome(false);
                setShowOrdersPage(false);
                setShowMessagesPage(false);
                setShowScanFlow(false);
                setShowScanPatientDetails(false);
              }}
              onOrdersClick={() => {
                setShowHome(false);
                setShowOrdersPage(true);
                setShowMessagesPage(false);
                setShowScanFlow(false);
                setShowScanPatientDetails(false);
              }}
              onMessagesClick={() => {
                setShowHome(false);
                setShowMessagesPage(true);
                setShowOrdersPage(false);
                setShowScanFlow(false);
                setShowScanPatientDetails(false);
              }}
              onScanClick={() => {
                const version = getCurrentVersion();
                setShowHome(false);
                setShowOrdersPage(false);
                setShowMessagesPage(false);
                if (version === "26A") {
                  // 26A: skip the patient-details pre-screen; go directly to the
                  // consolidated info step inside ScanFlowPage26A.
                  setScanEntryPatient(null);
                  setShowScanPatientDetails(false);
                  setShowScanFlow(true);
                } else {
                  // 26B: show the patient-details pre-screen as before.
                  setShowScanFlow(false);
                  setShowScanPatientDetails(true);
                }
              }}
              onOpenSettings={() => openSettings()}
              onOpenSupport={openSupport}
              onLockClick={() => {
                setShowLogin(true);
                setShowHome(true);
                setShowOrdersPage(false);
                setShowMessagesPage(false);
                setShowScanPatientDetails(false);
                setShowScanFlow(false);
                setSelectedPatient(null);
                setScanEntryPatient(null);
              }}
            />
          </div>
        ) : showMessagesPage ? (
          <div key="messages" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <MessagesPage
              selectedDentistId={selectedDentistId}
              onDentistChange={setSelectedDentistId}
              onBack={() => {
                setShowMessagesPage(false);
                setShowHome(true);
              }}
              onOpenSettings={() => openSettings()}
              onOpenSupport={openSupport}
            />
          </div>
        ) : showScanPatientDetails ? (
          <div key="scan-patient-details" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            {scanFlowVersion === "26A" ? (
              <ScanPatientDetailsPage26A
                selectedDoctorName={selectedDoctorName}
                onBack={() => {
                  setShowScanPatientDetails(false);
                  setShowHome(true);
                }}
                onOpenSettings={() => openSettings()}
                onOpenSupport={openSupport}
                onContinue={(p) => {
                  setScanEntryPatient(p);
                  setShowScanPatientDetails(false);
                  setShowScanFlow(true);
                }}
              />
            ) : (
              <ScanPatientDetailsPage
                selectedDoctorName={selectedDoctorName}
                onBack={() => {
                  setShowScanPatientDetails(false);
                  setShowHome(true);
                }}
                onOpenSettings={() => openSettings()}
                onOpenSupport={openSupport}
                onContinue={(p) => {
                  setScanEntryPatient(p);
                  setShowScanPatientDetails(false);
                  setShowScanFlow(true);
                }}
              />
            )}
          </div>
        ) : showScanFlow ? (
          <div key="scan-flow" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            {scanFlowVersion === "26A" ? (
              <ScanFlowPage26A
                initialPatient={scanEntryPatient ?? undefined}
                onBack={() => {
                  setShowScanFlow(false);
                  setScanEntryPatient(null);
                  setShowHome(true);
                }}
                onOpenSettings={() => openSettings()}
                onOpenSupport={openSupport}
              />
            ) : (
              <ScanFlowPage
                initialPatient={scanEntryPatient ?? undefined}
                onBack={() => {
                  setShowScanFlow(false);
                  setScanEntryPatient(null);
                  setShowHome(true);
                }}
                onOpenSettings={() => openSettings()}
                onOpenSupport={openSupport}
              />
            )}
          </div>
        ) : showOrdersPage ? (
          <div key="orders" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <OrdersPage
              selectedDoctorName={selectedDoctorName}
              selectedDentistId={selectedDentistId}
              onDentistChange={setSelectedDentistId}
              onBack={() => {
                setShowOrdersPage(false);
                setShowHome(true);
              }}
              onOpenSettings={() => openSettings()}
              onOpenSupport={openSupport}
            />
          </div>
        ) : selectedPatient ? (
          <div key="patient-orders" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <PatientOrders
              patient={selectedPatient}
              onBack={() => setSelectedPatient(null)}
              onOpenSettings={() => openSettings()}
              onOpenSupport={openSupport}
            />
          </div>
        ) : (
          <div key="patient-list" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <PatientList
              selectedDoctorName={selectedDoctorName}
              selectedDentistId={selectedDentistId}
              onDentistChange={setSelectedDentistId}
              onPatientClick={(patient: Patient) => setSelectedPatient(patient)}
              onOpenSettings={() => openSettings()}
              onOpenSupport={openSupport}
              onBack={() => setShowHome(true)}
            />
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          initialView={settingsInitialView}
          onClose={() => setShowSettings(false)}
          brightness={brightness}
          onBrightnessChange={setBrightness}
          volume={volume}
          onVolumeChange={setVolume}
        />
      )}

      <SupportModal open={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </>
  );
}

export default App;
