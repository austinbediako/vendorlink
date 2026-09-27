# Project guidance

## Homepage visual system

- Homepage illustrations and custom icons are React SVG components in `client/src/components/VisualAssets.jsx`. Reuse their geometry and the existing CSS color variables rather than adding unrelated illustration styles or libraries.
- Keep the current Inter / JetBrains Mono typography and warm-neutral / orange palette unless a redesign is explicitly requested.
- Homepage SVGs supplement nearby copy and are decorative (`aria-hidden`, not focusable). Keep essential meaning in accessible HTML, not only SVG labels.
- The navbar em dash blinks with CSS opacity only, reserves its width, is hidden from assistive technology, and stays static with reduced motion.
- The profile-required prompt uses a native modal dialog and a custom SVG illustration. Preserve its profile-setup/home navigation, Escape-to-home behavior, background inertness, and restoration of body overflow after dismissal. Test narrow/short viewports so both actions remain reachable.
- Evidence cards switch only on option hover, keyboard focus, or click/tap. Never reintroduce autoplay, scroll-driven switching, scroll-position changes, or body scroll locking. Verify both faces, rapid repeated toggles, selection persistence during scrolling, and both static groups in reduced-motion mode.

## Verification

- From `client/`: `pnpm build` and `pnpm lint`.
- Targeted visual code check: `pnpm exec oxlint src/components/VisualAssets.jsx src/components/EvidenceFlip.jsx src/pages/Home.jsx`.
- Check homepage widths 320, 390, 768, 900, 901, 1024, and 1440px. Evidence switches to three columns at 901px; both text and SVGs must fit without clipping.
- Verify logged-out and logged-in homepage branches, plus the shared navbar on mobile.
- At the visual-system implementation baseline, full-client lint reported 14 pre-existing warnings and no errors. The production build warned about a main chunk above 500 kB. Do not suppress warnings to pass verification.
