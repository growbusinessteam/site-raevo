# Playbook UI Specification

## Overview

- Target file: `src/pages/vendas.astro`
- Screenshot references:
  - `docs/design-references/blacksales-desktop.png`
  - `docs/design-references/blacksales-mobile.png`
- Interaction model: click-driven, rendered by the client controller

## DOM structure

- Standalone HTML document, not wrapped by the public Raevo marketing-site header/footer.
- Root `.sales-app`.
- `<aside class="sales-sidebar">` with brand, subtitle, stage navigation and progress meter.
- `<main class="sales-main">` containing:
  - `.sales-topbar` with current title, completion and reset button;
  - `#stage-content` scroll region;
  - `.sales-footer-nav` with previous/next actions.
- Global `#toast-region`.
- Local stylesheet `/styles/sales-playbook.css`.
- Local controller `/scripts/sales-playbook.js` with `defer`.

## Static metadata

- Title: `Raevo Sales — Diagnóstico Estratégico`
- Description: `Playbook de diagnóstico, prescrição e fechamento para calls comerciais com clínicas.`
- Load Inter and Playfair Display from Google Fonts.

## Required accessibility

- Navigation labeled “Etapas da call”.
- Active stage uses `aria-current="step"`.
- Main content uses a live-friendly heading update without stealing focus.
- Toast region uses `aria-live="polite"`.
- Previous/next/reset buttons have explicit types and labels.

## Responsive behavior

- Desktop: sidebar + main grid, full viewport height.
- Mobile under 760 px: one-column layout, horizontal stage rail, content/footer in normal flow.
