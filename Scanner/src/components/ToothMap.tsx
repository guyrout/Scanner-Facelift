/**
 * Tooth map / dental chart — Figma 4138:125920.
 * Uses the exported tooth-chart-scan SVG directly.
 */

import toothChartSvg from "../assets/scan/tooth-chart-scan.svg";

interface ToothMapProps {
  className?: string;
}

export default function ToothMap({ className }: ToothMapProps) {
  return (
    <div className={className ?? ""} style={{ width: 249 }}>
      <img
        src={toothChartSvg}
        alt="Dental chart"
        width={249}
        height={389}
        style={{ display: "block" }}
      />
    </div>
  );
}
