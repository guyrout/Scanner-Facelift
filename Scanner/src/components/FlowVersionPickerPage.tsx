/**
 * Pre-splash flow picker — choose between 26A and 26B UI Facelift experiences.
 */

import {
  setScanFlowVersion,
  type ScanFlowVersion,
} from "../utils/scanFlowVersionManager";

export interface FlowVersionPickerPageProps {
  onSelect: (version: ScanFlowVersion) => void;
}

const FLOW_OPTIONS: {
  id: ScanFlowVersion;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
}[] = [
  {
    id: "26A",
    title: "26A — UI Facelift",
    subtitle: "Previous scanner experience",
    description:
      "The current user experience with UI-only changes as part of the UI facelift.",
    accent: "#009ACE",
  },
  {
    id: "26B",
    title: "26B- UI Facelift",
    subtitle: "Q2 2026 work in progress",
    description:
      "Includes the latest 26B features, the full new RX flow, and the multilayer experience.",
    accent: "#009ACD",
  },
];

function IteroLogo() {
  return (
    <svg width="71" height="28" viewBox="0 0 71 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M63.2389 19.7792C63.2417 18.7027 63.0308 17.6364 62.6182 16.6421C62.2057 15.6478 61.5999 14.7454 60.8358 13.987C59.2477 12.4036 57.0828 11.532 54.7364 11.532C52.3919 11.532 50.2252 12.4036 48.639 13.987C47.8772 14.7461 47.2741 15.6491 46.8649 16.6435C46.4556 17.6379 46.2483 18.7039 46.2551 19.7792C46.2551 22.0073 47.0658 24.0664 48.5746 25.579C50.1307 27.1397 52.3202 28 54.7364 28C57.1527 28 59.3422 27.1397 60.9001 25.579C62.407 24.0664 63.2389 22.0073 63.2389 19.7792ZM59.4197 19.7792C59.4197 22.3042 57.2321 24.5192 54.7364 24.5192C52.2426 24.5192 50.0531 22.3042 50.0531 19.7792C50.0483 19.1467 50.1696 18.5196 50.4098 17.9344C50.6501 17.3493 51.0045 16.8179 51.4523 16.3712C52.3236 15.5008 53.5048 15.0118 54.7365 15.0118C55.9681 15.0118 57.1493 15.5008 58.0206 16.3712C58.4688 16.8176 58.8234 17.349 59.0636 17.9342C59.3039 18.5194 59.4249 19.1466 59.4197 19.7792ZM40.1254 15.8294H44.7869V11.8713H36.1682V27.7249H40.1254V15.8294ZM20.5939 21.2945H33.0215V20.7378C33.0215 18.0643 32.2312 15.7681 30.7357 14.0977C29.2534 12.4433 27.1358 11.532 24.7743 11.532C22.4506 11.532 20.3481 12.3989 18.8583 13.9738C17.427 15.4855 16.6386 17.5369 16.6386 19.7517C16.6386 21.9185 17.4195 23.9415 18.8356 25.4476C20.4067 27.117 22.6056 28 25.1959 28C27.8145 28 29.9738 27.0196 31.9608 24.9239L29.4216 22.3798C28.2172 23.7799 26.7463 24.5192 25.1675 24.5192C23.9273 24.5192 22.823 24.1401 21.9742 23.4217C21.315 22.8637 20.8349 22.1238 20.5939 21.2945ZM20.577 18.0956C20.9948 16.5584 22.2634 15.0118 24.746 15.0118C26.8219 15.0118 28.4611 16.2521 28.9281 18.0956H20.577ZM13.392 7.91404H18.8675V3.95686H3.95927V7.91404H9.43473V27.7249H13.392V7.91404Z"
        fill="black"
        fillOpacity="0.93"
      />
      <path d="M40.1254 15.8294H44.7869V11.8713H36.1682V27.7249H40.1254V15.8294Z" fill="black" fillOpacity="0.93" />
      <path d="M3.95718 11.8713H0V27.7249H3.95718V11.8713Z" fill="black" fillOpacity="0.93" />
      <path d="M3.95718 0H0V3.95718H3.95718V0Z" fill="black" fillOpacity="0.93" />
      <path
        d="M64.4516 11.8664H66.8465V12.3382H65.9222V14.8167H65.3708V12.3382H64.4516V11.8664Z"
        fill="black"
        fillOpacity="0.93"
      />
      <path
        d="M67.2317 11.8664H67.9573L68.4414 13.2707C68.5565 13.6152 68.6992 14.2613 68.6992 14.2613H68.7114C68.7114 14.2613 68.8541 13.6192 68.9652 13.2707L69.4401 11.8664H70.182V14.8167H69.6704V13.2778C69.6704 12.9568 69.7061 12.3586 69.7061 12.3586H69.6979C69.6979 12.3586 69.5756 12.9018 69.4798 13.1953L68.9214 14.8167H68.477L67.9145 13.1953C67.8187 12.9018 67.6964 12.3586 67.6964 12.3586H67.6882C67.6882 12.3586 67.7239 12.9568 67.7239 13.2778V14.8167H67.2317V11.8664Z"
        fill="black"
        fillOpacity="0.93"
      />
    </svg>
  );
}

export default function FlowVersionPickerPage({ onSelect }: FlowVersionPickerPageProps) {
  function handleSelect(version: ScanFlowVersion) {
    setScanFlowVersion(version);
    onSelect(version);
  }

  return (
    <div
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-center overflow-auto"
      style={{ backgroundColor: "var(--color-page-background)", fontFamily: "var(--font-roboto)" }}
    >
      <div className="flex w-full max-w-[960px] flex-col items-center px-6 py-10" style={{ gap: 40 }}>
        <div className="flex flex-col items-center text-center" style={{ gap: 12 }}>
          <IteroLogo />
          <h1 className="tp-heading-03 text-text-primary">Choose scan flow version</h1>
          <p className="tp-body-02 text-text-secondary max-w-[520px]">
            Select which prototype experience to open. Your choice applies to Scan, View, and related RX flows for this session.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {FLOW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className="flex flex-col items-start cursor-pointer border-0 appearance-none outline-none transition-ui text-left focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)]"
              style={{
                backgroundColor: "var(--color-background-layer-01)",
                borderRadius: 16,
                padding: 24,
                gap: 16,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                borderTop: `4px solid ${option.accent}`,
                fontFamily: "var(--font-roboto)",
              }}
              aria-label={`Open ${option.title}`}
            >
              <div className="flex flex-col w-full" style={{ gap: 4 }}>
                <span className="tp-heading-04 text-text-primary">{option.title}</span>
                <span className="tp-label-02 text-text-secondary">{option.subtitle}</span>
              </div>
              <p className="tp-body-02 text-text-secondary m-0">{option.description}</p>
              <span className="tp-body-02 text-[var(--color-text-interactive,#009ace)] mt-auto">
                Continue with {option.id} →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
