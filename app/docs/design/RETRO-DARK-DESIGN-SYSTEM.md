# DayFlow — Retro Dark Minimal Design System

## Product direction

A restrained retro-terminal/editorial interface: dark graphite surfaces, precise borders, compact monospace metadata, modern readable body typography, and one controlled lavender accent. The result should feel retro through typography, layout, labels, and motion—not through scanline filters, noisy textures, constant blinking, or excessive neon.

## Palette

| Token | Value | Usage |
|---|---|---|
| Background | #0A0C10 | App canvas |
| Sidebar | #0D1015 | Primary navigation |
| Surface | #12161D | Cards and lists |
| Raised surface | #171B23 | Menus/dialogs |
| Border | #2B313D | Separation |
| Primary text | #ECECF0 | Main content |
| Secondary text | #9BA2B0 | Supporting copy |
| Faint text | #687183 | Metadata, never essential instructions |
| Accent | #B8A3FF | Selected states and primary focus |
| Success | #9AD7AD | Confirmed status |
| Warning | #E7C47A | Caution |
| Danger | #FF8795 | Destructive/error state |

Avoid using accent as a large background. Keep it for short actions, selected navigation, progress, focus indicators, and subtle highlights.

## Typography

- Display/headings: a readable sans-serif, weight 600–700.
- Body: system sans-serif, comfortable line height, minimum 14–16 px for normal UI copy.
- Metadata, times, IDs, system status: monospace, 10–12 px, uppercase with moderate letter spacing.
- Never set long paragraphs in monospace or use tiny low-contrast text for actionable content.

## Layout principles

- Desktop: fixed/compact sidebar plus fluid content workspace; main content max-width tuned to the view.
- Mobile: bottom navigation or collapsible sidebar; minimum 44px touch targets and safe-area padding.
- Use consistent 8px spacing rhythm, 10–14px card radius, restrained shadows, and 1px borders.
- Prefer explicit hierarchy over nested cards. Every screen should have one primary task.
- Loading, empty, error, offline, access-denied and success states are first-class UX, not afterthoughts.

## Motion and transitions

- Route/content entrance: opacity plus 4–8px translate, 140–220ms, ease-out.
- Hover/focus: 120–160ms; subtle border/accent changes, no bouncing.
- Progress: animate only when the underlying value changes; 180–300ms.
- Modal/dialog: short fade with 6px scale/translate; restore focus on close.
- Task completion: icon/check state with subtle opacity/strike transition, not a large celebration.
- Respect prefers-reduced-motion: reduce globally and avoid animation that blocks input.
- Do not animate background scanlines continuously. Optional CRT grain must be very subtle, off by default, and never reduce text contrast.

## Interaction quality

- Strong keyboard focus rings and complete keyboard navigation.
- Buttons show idle, hover, pressed, disabled, pending and error states.
- Destructive actions require contextual confirmation and clear recovery expectations.
- Feedback distinguishes “saved locally” from “synced to Firebase.”
- Do not show “all systems nominal” unless that state is computed from real health checks; otherwise use neutral labels like “Workspace ready.”
- Use motion for orientation and state communication, not decoration.

## Proposed Today layout

- Header: date / workspace label / user and sync state.
- Main greeting plus small descriptor.
- Left wide region: Today execution progress and chronological runsheet.
- Right region: current focus block, task queue and last daily memory.
- Side navigation: Today, Schedule, Tasks, Reminders, Daily memory.
- Status footer: build or sync metadata only when accurate and useful.

## Performance/accessibility budget

- Prefer CSS transitions and existing icon dependency; do not add an animation library solely for basic transitions.
- Avoid heavy backdrop blur, canvas effects, animated shader backgrounds, large imagery and always-running timers.
- Use semantic buttons/links, labels for fields, non-color status cues and visible focus indicators.
- Validate at 320px, tablet and desktop widths; test keyboard-only, contrast, screen-reader names, and reduced motion.
