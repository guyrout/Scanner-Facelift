# Scroll Architecture — Root Cause & Refactor

## Root Cause Analysis

### 1. Nested Scroll Conflict (Primary)

**OrdersPage** had a page-level scroll container (`overflow-y-auto`) wrapping two cards, each with its own table scroll (`scrollbar-table`). This created **scroll-within-scroll**:

- When the user swiped on the In Progress table, the browser could route the gesture to either the **page** or the **table**
- The wrong element often scrolled (page instead of table), causing the sensation of "inverted" or blocked scroll
- Overscroll could chain unpredictably between levels

### 2. No Inverted Scroll Logic

Audit confirmed: no custom `wheel`, `touchmove`, or delta handlers. The perceived "inversion" was the wrong scroll target receiving the gesture, not actual delta inversion.

### 3. scroll-smooth Side Effects

`scroll-smooth` on the page container can introduce lag and non-native behavior on touch. Removed from scroll areas.

### 4. touch-action Overrides

`touch-action: manipulation` on `[role="button"]` and `.cursor-pointer` (table rows) was blocking pan gestures. Override with `pan-y pan-x` inside scroll containers is correct; structural fix reduces reliance on hacks.

---

## Refactored Architecture

### OrdersPage

- **Before**: `[Header] → [Page scroll] → [Card 1 + Card 2]` (page scrolls; each card’s table also scrolls)
- **After**: `[Header] → [Flex layout, no scroll] → [Card 1 | Card 2]` (each card `flex: 1 min-h-0`; only table bodies scroll)
- **Result**: Single level of scroll per table; no nested scroll; native touch behavior

### PatientList

- Single table; no nesting. Structure unchanged. CSS alignment with shared scroll utilities.

### PatientOrders

- Table scroll (vertical) + timeline scroll (horizontal). Different axes, no conflict. Unchanged.

### CSS Scroll Utilities

- `.scrollbar-table` / `.scrollbar-hidden`: `-webkit-overflow-scrolling: touch`, `touch-action: pan-y pan-x`, `overscroll-behavior: contain`
- No `transform` or `isolation` on scroll parents (breaks sticky)
- Descendant override for interactive rows inside scroll regions

---

## Virtualization

Current datasets (orders, patients) are small. Virtualization is deferred. Add `react-window` or similar if any table exceeds ~100 rows.

---

## Final Checklist

| Item | Status |
|------|--------|
| **Scroll direction** | Native (swipe up = content scrolls up / see below). No inverted logic. |
| **OrdersPage nested scroll** | Eliminated. Fixed viewport; only table bodies scroll. |
| **PatientList** | Single table scroll. No nesting. |
| **PatientOrders** | Table scroll + timeline horizontal. Different axes. |
| **Sticky headers** | Work correctly (no transform/isolation on scroll parents). |
| **overscroll-behavior: contain** | Applied to all scroll containers. No chaining. |
| **touch-action: pan-y pan-x** | On scroll containers + row descendants. No manipulation block. |
| **-webkit-overflow-scrolling: touch** | On all scroll areas. iOS momentum. |
| **scroll-behavior: auto** | Explicit. Native inertia on touch. |
| **No custom wheel/touch handlers** | Confirmed. Native scroll only. |
| **PatientOrders h-screen** | Changed to h-full for consistent flex layout. |
