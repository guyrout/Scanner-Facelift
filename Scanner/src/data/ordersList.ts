/**
 * Flattened order rows for the Orders page (In Progress / Past Orders).
 * Derived from patientOrders + patients; each row has order + patient info.
 */

import type { Order, OrderStatus } from "./orders";
import type { Patient } from "./patients";
import { patientOrders } from "./orders";
import { patients } from "./patients";

export type { OrderStatus };

export interface OrderWithPatient extends Order {
  patient: Patient;
}

function flattenOrdersWithPatients(): OrderWithPatient[] {
  const list: OrderWithPatient[] = [];
  for (const patient of patients) {
    const orders = patientOrders[patient.id] ?? [];
    for (const order of orders) {
      list.push({ ...order, patient });
    }
  }
  return list;
}

const allOrdersWithPatients = flattenOrdersWithPatients();

export const inProgressOrders: OrderWithPatient[] = allOrdersWithPatients.filter(
  (o) => o.status !== "completed"
);

export const pastOrders: OrderWithPatient[] = allOrdersWithPatients.filter(
  (o) => o.status === "completed"
);

export function filterPastOrders(query: string): OrderWithPatient[] {
  const q = query.trim().toLowerCase();
  if (!q) return pastOrders;
  return pastOrders.filter(
    (o) =>
      o.orderId.toLowerCase().includes(q) ||
      `${o.patient.firstName} ${o.patient.lastName}`.toLowerCase().includes(q) ||
      o.patient.patientId.toLowerCase().includes(q) ||
      o.procedure.toLowerCase().includes(q)
  );
}
