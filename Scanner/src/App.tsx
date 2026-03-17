import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import OrdersPage from "./components/OrdersPage";
import PatientList from "./components/PatientList";
import PatientOrders from "./components/PatientOrders";
import ScanFlowPage from "./components/ScanFlowPage";
import SettingsModal from "./components/SettingsModal";
import { DENTISTS, SHOW_ALL_DRS_ID } from "./components/OrdersHeader";
import type { Patient } from "./data/patients";

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
  const [showScanFlow, setShowScanFlow] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInitialView, setSettingsInitialView] = useState<"main" | "scan">("main");
  const [brightness, setBrightness] = useState(getStoredBrightness);
  const [volume, setVolume] = useState(getStoredVolume);
  const [selectedDentistId, setSelectedDentistId] = useState<string>(SHOW_ALL_DRS_ID);

  const openSettings = (view?: "main" | "scan") => {
    setSettingsInitialView(view ?? "main");
    setShowSettings(true);
  };

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
            <LoginPage onLogin={() => setShowLogin(false)} />
          </div>
        ) : showHome ? (
          <div key="home" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <HomePage
              onPatientListClick={() => {
                setShowHome(false);
                setShowOrdersPage(false);
                setShowScanFlow(false);
              }}
              onOrdersClick={() => {
                setShowHome(false);
                setShowOrdersPage(true);
                setShowScanFlow(false);
              }}
              onScanClick={() => {
                setShowHome(false);
                setShowOrdersPage(false);
                setShowScanFlow(true);
              }}
              onOpenSettings={() => openSettings()}
            />
          </div>
        ) : showScanFlow ? (
          <div key="scan-flow" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <ScanFlowPage
              onBack={() => {
                setShowScanFlow(false);
                setShowHome(true);
              }}
              onOpenSettings={() => openSettings()}
            />
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
            />
          </div>
        ) : selectedPatient ? (
          <div key="patient-orders" className="animate-page-enter flex flex-col w-full h-full min-h-0">
            <PatientOrders
              patient={selectedPatient}
              onBack={() => setSelectedPatient(null)}
              onOpenSettings={() => openSettings()}
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
    </>
  );
}

export default App;
