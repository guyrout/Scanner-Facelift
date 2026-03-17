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
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
    { orderId: "67040521", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "completed" },
  ],
  "2": [
    { orderId: "35040523", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
  ],
  "3": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
  ],
  "4": [
    { orderId: "80040524", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
  ],
  "5": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "sent_to_lab" },
  ],
  "6": [
    { orderId: "24040527", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "completed" },
    { orderId: "35040523", procedure: "Denture/Removable", niri: false, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
    { orderId: "67040521", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
    { orderId: "80040524", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "sent_to_lab" },
    { orderId: "90040522", procedure: "Denture/Removable", niri: false, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "sent_to_lab" },
  ],
  "7": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
    { orderId: "90040522", procedure: "Denture/Removable", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "completed" },
  ],
  "8": [
    { orderId: "67040521", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
  ],
  "9": [
    { orderId: "14040532", procedure: "Denture/Removable", niri: false, scanDate: "03/10/2024", lastModified: "03/10/2024", status: "rx_created" },
  ],
  "10": [
    { orderId: "24040527", procedure: "Fixed Restorative", niri: false, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "rx_created" },
  ],
  "11": [
    { orderId: "35040523", procedure: "Study Model/iRecord", niri: true, scanDate: "02/22/2024", lastModified: "02/22/2024", status: "completed" },
  ],
  "12": [
    { orderId: "12040501", procedure: "Study Model/iRecord", niri: true, scanDate: "02/20/2024", lastModified: "02/20/2024", status: "rx_created" },
  ],
  "13": [
    { orderId: "13040501", procedure: "Denture/Removable", niri: false, scanDate: "02/18/2024", lastModified: "02/18/2024", status: "completed" },
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
  return { inProgress, past };
}
