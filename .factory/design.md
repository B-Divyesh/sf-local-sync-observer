# Local Sync Observer — visual thesis

## Direction: the convergence field instrument

Local Sync Observer uses **neo-brutalist utility** as a working instrument, not a style costume. Its job is to turn uncertain, scattered sync evidence into one careful reading. The interface therefore borrows from technician labels, paper incident tickets, and the hard edges of a test bench: thick ink rules, offset shadows, explicit status words, and dense-but-readable measurements. It never uses a soft gradient to imply that things are healthy. Evidence earns the status.

The landing page and desktop app share the same visual grammar. The site introduces the “observe, never alter” promise; the app presents evidence with less decoration and more density. The design is intentionally single-mode: a warm, high-contrast light treatment evokes a marked-up field sheet and prevents ambiguous status glows. The background is painted explicitly.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#F4F0E6` | warm background; less clinical than white |
| `panel` | `#FFFDF5` | inspected surface |
| `ink` | `#171717` | text and structural rules |
| `muted-ink` | `#5A574F` | supporting text (7.0:1 on paper) |
| `signal` | `#FFE34F` | selection and attention; never status alone |
| `link` | `#0645D1` | providers and actions (7.0:1 on paper) |
| `good` | `#176B45` | convergence, paired with ✓ and words |
| `warn` | `#8A4B00` | pending/offline, paired with symbols and words |
| `danger` | `#A62121` | conflicts/errors, paired with ! and words |
| `shadow` | `#171717` | 4 px offset depth, never blurred |

All text combinations target WCAG AA. Yellow is an attention surface only; black text supplies contrast. Status is always repeated in an icon, label, and explanation.

## Type

- **Display / labels:** `Arial Black`, `Arial`, system sans. Heavy, compact, uppercase only for short instrument labels.
- **Body / data:** `ui-monospace`, `SFMono-Regular`, `Cascadia Code`, `Roboto Mono`, monospace. It makes paths, timestamps, counts, and provider evidence visually trustworthy. No fonts load from the network.
- Scale: 14 px metadata, 16 px body, 20 px section, 32 px product heading, fluid 44–72 px landing headline. Body leading is 1.55; measure is capped near 68 characters.

## Space and structure

The base unit is 4 px. Working gaps are 8, 12, 16, 24, 32, 48, and 72 px. Structural borders are 2 px ink; primary panels use a 4 px solid offset shadow. Corners are 0–4 px: status is factual, not soft. Buttons and fields are at least 44 px high. Desktop uses a 240 px evidence rail and a flexible content area; below 760 px, the rail becomes a compact summary and details stack. The phone landing page drops ornamental annotations and moves downloads ahead of secondary narrative.

## Interaction grammar

- Primary actions are filled ink rectangles; secondary actions are paper with an ink rule.
- Hover moves a raised control `2px 2px` toward its shadow. Pressing seats it fully.
- Selecting a source uses a yellow block and left-side black registration mark.
- Live changes briefly invert the status chip and announce through an ARIA live region.
- Setup and removal are explicit. Local credentials are masked after save. No destructive file action exists in the product.
- Empty, loading, offline, partial-coverage, and provider-error states have equal visual weight and a clear next action.

## Motion policy

Motion is reserved for state continuity: panels enter 12 px from their origin over 180 ms, a refreshed timestamp cross-fades over 150 ms, and buttons compress over 80 ms. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and transitions are removed and changes occur instantly; status meaning remains complete through shape and language.

## Original asset plan and provenance

The core raster illustration is **“Convergence inspection board”**, used on the landing page to explain the observer model. It depicts three separate local device/folder lanes arriving at a central inspection aperture, where two align and one visible red notched card flags a conflict. The observer is an external viewing frame, never a cloud and never an engine. Small UI icons are hand-authored inline SVG with geometric strokes; they are not generated and use no third-party marks.

### Prompt sheet

- **Use case:** `stylized-concept`
- **Asset type:** wide landing-page hero illustration
- **Subject/world:** an abstract desktop synchronization inspection board; three colored local device/folder tracks feeding into a central glass viewing aperture; two tracks line up, one red notched paper tab visibly diverges; no people
- **Materials:** thick cut paper, black screen-printed rules, translucent inspection glass, tiny metal fasteners, tactile ink registration marks
- **Light/lens:** flat overhead editorial product lighting, slight oblique depth, crisp shadows, 50 mm-equivalent graphic still life
- **Palette words:** warm paper, near-black ink, acid signal yellow, cobalt blue, restrained forest green, conflict red
- **Composition:** landscape, apparatus weighted right-of-center with breathing room; strong legibility at small size
- **Negative list:** no text, no letters, no numbers, no watermark, no logos, no brands, no people, no cloud symbol, no glossy 3D, no purple gradient, no neon, no illegible pseudo-interface

Generation command: `/opt/fleet/lib/gen-image.sh` using the factory `factory-image` deployment, 1536×1024, high quality. Generated 2026-08-28. The selected output is original AI-generated imagery for this product; prompt sidecar is retained in `assets/src/`. It will be reviewed for text artifacts, seams, misleading symbols, and palette consistency, then exported to WebP (hero mobile budget ≤300 KB).

The social preview at `public/assets/social-card.png` is a 1200×630 center crop composed from the reviewed original convergence-board artwork on 2026-08-30. The 180 px Apple touch icon is a raster derivative of the hand-authored `app-icon.svg`.

The three walkthrough images in `public/assets/walkthrough-*.webp` are original 900×600 captures of the v0.1.6 desktop UI, recorded in Chromium on 2026-09-02. They show the empty state, source setup, and bundled mixed-provider sample; no stock or third-party imagery is used.

## Why this fits

Sync tools often communicate certainty with soothing green dots. This product must do the opposite: show the evidence boundary and say “not enough evidence” when it cannot prove convergence. The inspection-board metaphor, hard registration marks, paper tickets, and visibly offset layers make that epistemic caution tangible while remaining fast and legible for a utility people open during a stressful incident.
