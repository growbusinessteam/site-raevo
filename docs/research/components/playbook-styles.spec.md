# Playbook Styles Specification

## Overview

- Target file: `public/styles/sales-playbook.css`
- Screenshots:
  - `docs/design-references/blacksales-desktop.png`
  - `docs/design-references/blacksales-mobile.png`

## Design tokens

- Background: `#0a0a0a`
- Sidebar: `#0d0d0d`
- Surface: `#121212`
- Input: `#1f1f1f`
- Border: `#242424`
- Text: `#e8e6e3`
- Secondary text: `#c5c1b9`
- Muted: `#808080`
- Gold: `#c4a34f`
- Gold light: `#dfc36d`
- Danger: `#cf3030`
- Body font: Inter
- Display font: Playfair Display

## Layout

- Desktop app fills `100dvh`.
- Sidebar is 188 px, border-right, flex column.
- Main is a three-row grid: 64 px topbar, scrollable content, 72 px footer.
- Content max-width is 980 px with 24–32 px gutters.
- Cards use `#121212`, 1 px border, 10 px radius and 18–22 px padding.
- Form controls use 14 px type, 8–10 px vertical padding and 6 px radius.

## Components

- Gold gradient primary buttons.
- Numbered stage circles with active gold fill and completed subtle gold outline.
- Diagnostic option cards, selected states, tab pills and pain chips.
- Score dashboard with five progress bars and severity badges.
- Generated report blocks with gold/danger accent borders.
- Objection accordions with animated reveal.
- Toasts bottom-right.
- Print stylesheet hides chrome and prints only consolidated report content.

## Responsive

- Under 760 px: sidebar becomes top rail, nav scrolls horizontally, stage buttons compact, field grids stack.
- Under 480 px: one-column controls and full-width action buttons.

## Motion

- 160–220 ms ease transitions.
- Stage content fade/translate entrance.
- Respect `prefers-reduced-motion`.
