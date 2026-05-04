import type { Patient } from "./patients";
import { patients } from "./patients";

export type OrderStatus = "completed" | "rx_created" | "sent_to_lab";

export interface Order {
  orderId: string;
  procedure: string;
  niri: boolean;
  scanDate: string;
  lastModified: string;
  status: OrderStatus;
}

export interface OrderWithPatient extends Order {
  patient: Patient;
}

export const patientOrders: Record<string, Order[]> = {
  "1": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "01/12/2026", lastModified: "01/13/2026", status: "rx_created" },
    { orderId: "67040521", procedure: "Study Model/iRecord", niri: true, scanDate: "02/05/2026", lastModified: "02/05/2026", status: "completed" },
  ],
  "2": [
    { orderId: "35040523", procedure: "Study Model/iRecord", niri: true, scanDate: "02/18/2026", lastModified: "02/19/2026", status: "rx_created" },
  ],
  "3": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "02/20/2026", lastModified: "02/21/2026", status: "rx_created" },
  ],
  "4": [
    { orderId: "80040524", procedure: "Study Model/iRecord", niri: true, scanDate: "03/01/2026", lastModified: "03/02/2026", status: "rx_created" },
  ],
  "5": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "03/10/2026", lastModified: "03/10/2026", status: "sent_to_lab" },
  ],
  "6": [
    { orderId: "24040527", procedure: "Study Model/iRecord", niri: true, scanDate: "01/08/2026", lastModified: "01/09/2026", status: "completed" },
    { orderId: "35040523", procedure: "Denture/Removable", niri: false, scanDate: "02/11/2026", lastModified: "02/12/2026", status: "rx_created" },
    { orderId: "67040521", procedure: "Study Model/iRecord", niri: true, scanDate: "03/22/2026", lastModified: "03/22/2026", status: "rx_created" },
    { orderId: "80040524", procedure: "Study Model/iRecord", niri: true, scanDate: "04/14/2026", lastModified: "04/15/2026", status: "sent_to_lab" },
    { orderId: "90040522", procedure: "Denture/Removable", niri: false, scanDate: "05/01/2026", lastModified: "05/02/2026", status: "sent_to_lab" },
  ],
  "7": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "04/05/2026", lastModified: "04/06/2026", status: "rx_created" },
    { orderId: "90040522", procedure: "Denture/Removable", niri: true, scanDate: "04/12/2026", lastModified: "04/12/2026", status: "completed" },
  ],
  "8": [
    { orderId: "67040521", procedure: "Study Model/iRecord", niri: true, scanDate: "04/20/2026", lastModified: "04/21/2026", status: "rx_created" },
  ],
  "9": [
    { orderId: "14040532", procedure: "Denture/Removable", niri: false, scanDate: "03/25/2026", lastModified: "03/26/2026", status: "rx_created" },
  ],
  "10": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "04/26/2026", lastModified: "04/27/2026", status: "rx_created" },
  ],
  "11": [
    { orderId: "35040523", procedure: "Study Model/iRecord", niri: true, scanDate: "05/02/2026", lastModified: "05/03/2026", status: "completed" },
  ],
  "12": [
    { orderId: "12040501", procedure: "Study Model/iRecord", niri: true, scanDate: "02/02/2026", lastModified: "02/03/2026", status: "rx_created" },
  ],
  "13": [
    { orderId: "13040501", procedure: "Denture/Removable", niri: false, scanDate: "01/28/2026", lastModified: "01/29/2026", status: "completed" },
  ],
};

export function getOrdersForPatient(patientId: string): Order[] {
  return patientOrders[patientId] ?? [];
}

function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getAllOrdersForOrdersPage(): {
  inProgress: OrderWithPatient[];
  past: OrderWithPatient[];
} {
  const inProgress: OrderWithPatient[] = [];
  const past: OrderWithPatient[] = [];
  for (const [patientId, orders] of Object.entries(patientOrders)) {
    const patient = getPatientById(patientId);
    if (!patient) continue;
    for (const order of orders) {
      const row: OrderWithPatient = { ...order, patient };
      if (order.status === "completed") {
        past.push(row);
      } else {
        inProgress.push(row);
      }
    }
  }
  // Past table: keep Mina Young’s completed Study Model/iRecord row last (demo ordering).
  const minaStudyCompletedIdx = past.findIndex(
    (r) =>
      r.patient.id === "6" &&
      r.orderId === "24040527" &&
      r.procedure === "Study Model/iRecord" &&
      r.scanDate === "01/08/2026",
  );
  if (minaStudyCompletedIdx !== -1) {
    const [minaRow] = past.splice(minaStudyCompletedIdx, 1);
    past.push(minaRow);
  }
  return { inProgress, past };
}
