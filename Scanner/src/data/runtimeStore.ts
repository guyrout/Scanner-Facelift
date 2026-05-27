/**
 * Runtime store for patients + orders.
 *
 * The app's seed data lives in `data/patients.ts` and `data/orders.ts` as
 * static modules. This store layers in-memory runtime additions on top so
 * the scan flow can create a new order (and optionally a new patient) at
 * Confirm & Send, then have it appear immediately on the patient orders
 * page, the all-orders page, and the patient list.
 *
 * Subscribers re-render via `useSyncExternalStore`; we bump a snapshot id
 * on every mutation so React detects the change without us needing to
 * clone the underlying arrays every time.
 */

import { useSyncExternalStore } from "react";
import type { Order, OrderWithPatient } from "./orders";
import { patientOrders as seedPatientOrders } from "./orders";
import type { Patient } from "./patients";
import { patients as seedPatients } from "./patients";

type Listener = () => void;

const listeners = new Set<Listener>();

const runtimePatients: Patient[] = [];
const runtimeOrdersByPatient: Record<string, Order[]> = {};
/** IDs of orders that were added at runtime (used by views to opt out of
 *  date massaging that only makes sense for seed rows). */
const runtimeOrderIds = new Set<string>();

let snapshotId = 0;

function notify() {
  snapshotId += 1;
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshotId() {
  return snapshotId;
}

/** Append a new patient to the runtime list. The id should be unique
 *  across both seed and runtime patients; callers can use `generatePatientId`. */
export function addRuntimePatient(patient: Patient): void {
  runtimePatients.push(patient);
  notify();
}

/** Prepend a new order so it shows up first in the patient's orders list. */
export function addRuntimeOrder(internalPatientId: string, order: Order): void {
  const existing = runtimeOrdersByPatient[internalPatientId] ?? [];
  runtimeOrdersByPatient[internalPatientId] = [order, ...existing];
  runtimeOrderIds.add(order.orderId);
  notify();
}

/** Look up a patient by internal id across seed + runtime. */
export function findPatientById(id: string): Patient | undefined {
  return seedPatients.find((p) => p.id === id) ?? runtimePatients.find((p) => p.id === id);
}

/** Whether the given order id was created at runtime (vs. seeded). */
export function isRuntimeOrder(orderId: string): boolean {
  return runtimeOrderIds.has(orderId);
}

/** Generate a unique internal patient id that won't collide with seed ids. */
export function generatePatientId(): string {
  return `rt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/** Generate an 8-digit numeric-looking order id (matches seed format). */
export function generateOrderId(): string {
  const n = Math.floor(10_000_000 + Math.random() * 89_999_999);
  return String(n);
}

/** Generate the next chart number for a new patient when the user didn't
 *  fill one in. Uses (max existing numeric chart) + 1 so the new value is
 *  visually consistent with the seed data (8 digits, no leading zeros). */
export function generateChartNumber(): string {
  const seen = [...seedPatients, ...runtimePatients]
    .map((p) => Number(p.patientId))
    .filter((n) => Number.isFinite(n) && n > 0);
  const next = (seen.length > 0 ? Math.max(...seen) : 14_129_125) + 1;
  return String(next);
}

/* ---------------------------------------------------------------------- */
/* Hooks                                                                   */
/* ---------------------------------------------------------------------- */

/** All patients (seed first, then runtime additions). Recomputed lazily. */
export function useRuntimePatients(): Patient[] {
  const id = useSyncExternalStore(subscribe, getSnapshotId, getSnapshotId);
  // `id` is unused in the result but ties the memoization to the snapshot.
  void id;
  return [...seedPatients, ...runtimePatients];
}

/** Orders for a single patient (runtime additions first, then seed). */
export function useRuntimeOrdersForPatient(internalPatientId: string): Order[] {
  const id = useSyncExternalStore(subscribe, getSnapshotId, getSnapshotId);
  void id;
  const runtime = runtimeOrdersByPatient[internalPatientId] ?? [];
  const seed = seedPatientOrders[internalPatientId] ?? [];
  return [...runtime, ...seed];
}

/** All orders grouped into in-progress + past, across every patient. Mirrors
 *  `getAllOrdersForOrdersPage` but reflects runtime additions. */
export function useRuntimeAllOrdersForOrdersPage(): {
  inProgress: OrderWithPatient[];
  past: OrderWithPatient[];
} {
  const id = useSyncExternalStore(subscribe, getSnapshotId, getSnapshotId);
  void id;

  const inProgress: OrderWithPatient[] = [];
  const past: OrderWithPatient[] = [];

  // Combine seed + runtime patient maps. Runtime orders are listed first so
  // newly-created orders show at the top of the in-progress table.
  const allPatientIds = new Set<string>([
    ...Object.keys(seedPatientOrders),
    ...Object.keys(runtimeOrdersByPatient),
  ]);

  for (const patientId of allPatientIds) {
    const patient = findPatientById(patientId);
    if (!patient) continue;
    const runtime = runtimeOrdersByPatient[patientId] ?? [];
    const seed = seedPatientOrders[patientId] ?? [];
    for (const order of [...runtime, ...seed]) {
      const row: OrderWithPatient = { ...order, patient };
      if (order.status === "completed") past.push(row);
      else inProgress.push(row);
    }
  }

  // Preserve the demo ordering tweak from the original helper (Mina Young's
  // completed Study Model row goes last).
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
