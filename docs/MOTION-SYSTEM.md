# Motion & Micro-Interaction System

**Enterprise medical SaaS · Clinical-grade UX**

This document defines the motion and micro-interaction system for a professional medical product supporting desktop (mouse + keyboard) and touch (tablet, large touch screens, kiosk) environments. Motion is restrained, purposeful, and reinforces trust, clarity, and operational efficiency.

---

## 1. Motion Design Principles (Design System Level)

### Core philosophy

| Principle | Application |
|-----------|-------------|
| **Subtle, restrained, purposeful** | Every animation communicates state, hierarchy, or feedback. No decorative motion. |
| **No playful or entertainment-style motion** | No elastic, bounce, or overshoot. No parallax. |
| **Reduce cognitive load** | Support high-focus clinical workflows; avoid distraction. |
| **Reinforce reliability and precision** | Calm, intelligent, controlled. Comparable to high-end enterprise healthcare systems. |

### Design constraints

- **No motion larger than 24px** (translates, slides) unless explicitly defined for a specific pattern.
- **GPU-friendly properties only**: `opacity`, `transform` (translate, scale). Avoid animating `width`, `height`, or `box-shadow` over long distances; use where necessary with short duration.
- **Never delay clinical workflows**: Animations must not block or slow critical actions.
- **Exit mirrors entrance**: Dismissal animations are the reverse of entry (same duration, opposite direction).

### Timing tiers

| Tier | Duration range | Use |
|------|----------------|-----|
| **Micro** | 120–220 ms | Buttons (hover/active), focus rings, row highlight, selection fade |
| **Component** | 200–280 ms | Dropdowns, form focus, modals (content), notifications |
| **Page** | 250–400 ms | Page transitions, panel expansion, overlay backdrops |

Touch interactions use the **upper end** of each range (e.g. 180 ms for tap feedback, 300–400 ms for page transitions).

### Easing system

| Token | Curve | Use |
|-------|--------|-----|
| `--motion-ease-in-out` | `cubic-bezier(0.33, 0, 0.2, 1)` | State changes, hover, focus — smooth both ends (Material-style) |
| `--motion-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances (page, modal, panel) — very smooth deceleration |
| `--motion-ease-in` | `cubic-bezier(0.55, 0, 0.1, 1)` | Exits — smooth acceleration |

---

## 2. Platform Differences: Desktop vs Touch

### Desktop (mouse + keyboard)

- **Hover**: Used for elevation, highlight, and affordance. Soft `translateY(-1px)` + shadow increase where appropriate.
- **Active**: Subtle press `scale(0.98)`; 150–200 ms.
- **Focus**: Visible focus ring; transition 150 ms.
- **Transitions**: Shorter end of ranges (250–300 ms page, 200–220 ms component).
- **Spatial continuity**: Soft fade + directional slide (8–16 px max).

### Touch (tablet / large touch / kiosk)

- **No hover**: No reliance on hover state for feedback.
- **Tap**: Scale 0.97 → 1, 120–180 ms. Visual confirmation without bounce.
- **Transitions**: Slightly longer (300–400 ms page, 220–280 ms component) for clarity.
- **Spatial continuity**: Horizontal slide for drill-down; optional subtle scale (0.98 → 1) for depth.
- **Bottom sheets**: For contextual actions; 300–350 ms slide-up; respect thumb reach zones.
- **Gesture-aligned direction**: If navigation is swipe-based, motion direction follows gesture.

---

## 3. Page-to-Page Transitions

### Transition matrix (main screens)

| From → To | Desktop | Touch |
|-----------|---------|-------|
| Dashboard → Patient Profile | Fade + slide right 8–12 px, 250–300 ms | Slide left (new content), 300–350 ms |
| Patient Profile → Treatment Plan | Fade + slide right 8–12 px, 250–300 ms | Slide left, 300–350 ms |
| Treatment Plan → Imaging / X-ray View | Fade + slide up 8–12 px, 250–300 ms | Slide up or fade + scale 0.99→1, 300 ms |
| Any → Modal overlay | Backdrop 150 ms; modal 220–280 ms (see Modals) | Same; bottom sheet 300–350 ms where applicable |
| Side panel expansion → Detail view | Panel: width/transform 250–280 ms; content fade 200 ms | Same; 280–320 ms |

### Implementation notes

- **Max displacement**: 8–16 px (desktop), up to 24 px for touch drill-down if needed.
- **Easing**: `--motion-ease-out` for enter; same curve for exit, reversed direction.
- **No full-screen dramatic transitions**: No full viewport slides or spins.

### Example: Page enter (existing pattern)

```css
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Example: Directional slide (e.g. Patient Profile from Dashboard)

```css
@keyframes page-enter-from-right {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

Use `translateX(-12px)` for enter-from-left when content is “back” from a drill-down.

---

## 4. In-Page Micro-Interactions

### 4.1 Buttons

| State | Desktop | Touch |
|-------|---------|-------|
| **Hover** | `translateY(-1px)` + shadow increase; 150–200 ms | N/A |
| **Active** | `scale(0.98)`; 150–200 ms | `scale(0.97)` → 1; 120–180 ms |
| **Focus** | Ring transition 150 ms | Same |

No bounce, no elastic.

**CSS (existing `.transition-press`, `.active-press`):**

```css
.transition-press {
  transition: transform var(--motion-duration-press) var(--motion-ease-in-out);
}
.active-press:active {
  transform: scale(0.97);
}
```

**Optional hover elevation (desktop-only):**

```css
.btn-elevation:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}
```

---

### 4.2 Form fields

| State | Behavior | Duration |
|-------|----------|----------|
| **Focus** | Border highlight (color transition) | 150 ms |
| **Label float** | Opacity/transform for floating label | 180–220 ms |
| **Error** | Border color transition + micro-shake 4 px, max 1 cycle | 180 ms |
| **Success** | Checkmark fade-in | 200 ms |

**Error shake (subtle, one cycle):**

```css
@keyframes input-shake-error {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.input-error {
  animation: input-shake-error 180ms var(--motion-ease-in-out);
}
```

No aggressive or repeated shake.

---

### 4.3 Dropdowns & selectors

| Context | Behavior | Duration |
|---------|----------|----------|
| **Desktop** | Fade + 8 px vertical slide down | 200 ms |
| **Touch** | Expand (height/scaleY or max-height) with easing | 220–280 ms |

Container transform only; avoid animating large DOM trees. Use `transform: scaleY(0)` → `scaleY(1)` with `transform-origin: top` if preferred over height.

---

### 4.4 Tables

| Interaction | Behavior | Duration |
|-------------|----------|----------|
| **Row hover** | Background fade-in | 120 ms |
| **Row expansion** | Height (max-height) + opacity | 250 ms |
| **Sorting** | Opacity shift on column header (optional) | 150 ms |
| **Selection** | Background fade | 150 ms |

No row jumpiness; prefer `transform` for any movement.

---

### 4.5 Modals & drawers

| Layer | Desktop | Touch |
|-------|---------|-------|
| **Backdrop** | Fade 150 ms | Same |
| **Modal** | Scale 0.98 → 1 + fade; 220–280 ms | Same or bottom sheet slide-up 300–350 ms |
| **Exit** | Reverse of entrance | Same |

**Existing modal pattern (align with this):**

```css
@keyframes modal-content-enter {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

### 4.6 Notifications & alerts

| Type | Enter | Exit |
|------|--------|------|
| **Standard** | Slide + fade, max 12 px; 220 ms | Fade 200 ms |
| **Critical medical** | Same; no bounce. Optional: very subtle pulse opacity (max 1 cycle) | Same |

No bouncing. Critical alerts use restrained emphasis only.

---

## 5. System States

### Loading

- **Skeleton shimmer**: Subtle, slow (cycle 1.2–1.6 s). No spinning loaders for long operations when a skeleton is shown.
- **Spinner**: Only when no skeleton (e.g. inline small indicator); minimal motion.

### Saving / syncing

- Micro status indicator near action source.
- Fade in/out 180 ms.
- No blocking overlay unless critical.

### Success

- Soft color transition; icon fade-in 200 ms.

### Error

- Controlled color change; subtle emphasis (e.g. border or background transition). Not alarming; no aggressive motion.

---

## 6. Accessibility & Compliance

### prefers-reduced-motion

- **Requirement**: All motion must respect `prefers-reduced-motion: reduce`.
- **Behavior**: Transition/animation duration set to **0.01 ms** (instant state change). No removal of state change — only removal of motion.
- **Implementation**: Existing pattern in `index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .transition-ui,
  .transition-ui-focus,
  .transition-press {
    transition-duration: 0.01ms;
  }
  .animate-page-enter,
  .animate-modal-backdrop-enter,
  .animate-modal-content-enter,
  .animate-modal-content-enter-centered {
    animation-duration: 0.01ms;
    animation-delay: 0ms;
  }
  .active-press:active {
    transform: none;
  }
}
```

- **Scope**: Every new motion class or animation must be listed in this block.

### Additional rules

- **No parallax**.
- **No motion larger than 24 px** (except documented exceptions).
- **GPU-friendly**: Prefer `opacity` and `transform` only.
- **No motion that blocks or delays critical clinical actions**.

---

## 7. Timing & Token Reference

### Recommended CSS custom properties

Align with existing tokens; extend as needed:

```css
/* Existing */
--motion-duration-press: 160ms;      /* active press */
--motion-duration-interact: 250ms;   /* hover, focus, state */
--motion-duration-emphasis: 350ms;   /* page/modal enter */
--motion-ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--motion-ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);

/* Optional extensions (smooth, calmer feel) */
--motion-duration-micro: 180ms;       /* row hover, focus ring */
--motion-duration-component: 260ms;  /* dropdown, modal content */
--motion-duration-page: 350ms;       /* page transition desktop */
--motion-duration-page-touch: 400ms; /* page transition touch */
--motion-ease-in: cubic-bezier(0.55, 0, 0.1, 1); /* exits */
```

### Duration by interaction type

| Type | Desktop | Touch |
|------|---------|-------|
| Micro (button, focus, row) | 120–200 ms | 120–180 ms (tap) |
| Component (dropdown, modal) | 200–280 ms | 220–280 ms |
| Page | 250–350 ms | 300–400 ms |

---

## 8. Example Snippets

### CSS: Button with hover elevation (desktop)

```css
.btn-primary {
  transition: transform var(--motion-duration-press) var(--motion-ease-in-out),
              box-shadow var(--motion-duration-interact) var(--motion-ease-in-out);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}
.btn-primary:active {
  transform: translateY(0) scale(0.98);
}
```

### CSS: Notification enter

```css
@keyframes notification-enter {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.notification-enter {
  animation: notification-enter 220ms var(--motion-ease-out) forwards;
}
```

### Framer Motion: Page transition (direction-aware)

```tsx
const pageVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 12 : -12,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -12 : 12,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  }),
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  custom={direction}
>
  {children}
</motion.div>
```

### Framer Motion: Modal with reduced-motion support

```tsx
const modalVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  },
};

<motion.div
  variants={modalVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  style={{ transformOrigin: 'center center' }}
>
  {/* modal content */}
</motion.div>
```

In Framer Motion, use `useReducedMotion()` to set duration to 0 when the user prefers reduced motion.

---

## 9. Performance Recommendations

- **Use only `opacity` and `transform`** for animated properties where possible.
- **Avoid** animating `width`, `height`, `top`, `left` on large components; prefer `transform: translate()` and `scale()`.
- **Contain layers**: Use `will-change: transform` sparingly and only during the animation; remove after.
- **Limit simultaneous animations**: Avoid many elements animating at once (e.g. stagger with short delays if needed).
- **Test on low-end devices** used in clinical environments.

---

## 10. Summary: State Change Logic

| State change | Motion | Duration | Easing |
|--------------|--------|----------|--------|
| Button hover | translateY(-1px), shadow | 150–200 ms | ease-in-out |
| Button active | scale(0.98) | 150–200 ms | ease-in-out |
| Form focus | border color | 150 ms | ease-in-out |
| Form error | color + 4 px shake (1×) | 180 ms | ease-in-out |
| Form success | checkmark fade-in | 200 ms | ease-out |
| Dropdown open | fade + 8 px slide | 200 ms | ease-in-out |
| Row hover | background fade | 120 ms | ease-in-out |
| Row expand | height + opacity | 250 ms | ease-out |
| Modal backdrop | opacity | 150 ms | ease-out |
| Modal content | scale 0.98→1, fade | 220–280 ms | ease-out |
| Page enter | fade + 8–16 px slide | 250–350 ms | ease-out |
| Notification | slide + fade, ≤12 px | 220 ms | ease-out |

---

*Document version: 1.0 · Enterprise medical SaaS motion system · Clinical-grade, premium, mission-critical.*
