# Playbook Controller Specification

## Overview

- Target file: `public/scripts/sales-playbook.js`
- Data source: `/data/sales-playbook.json`
- Interaction model: click, input, local persistence, clipboard and print

## Required state

- `currentStep`, `activeDiagnosticTab`
- `fields` object for call metadata, rapport, opening, operational context, goals, pains and closing
- `diagnostics` keyed by question id with selected option(s), pain, other scenario, notes and extra fields
- `procedures` list
- schema version

## Required rendering

- Build sidebar stages and update active/completed states.
- Render all twelve stages.
- Render diagnostic operational context, score overview, six tabs, generic question cards and SPIN groups.
- Render generated stages from live state: stack, plan, pitch, offer and summary.
- Render objection accordion library and substitute placeholders.

## Required behaviors

- Event delegation for navigation, options, tabs, procedure actions, copy, print, accordion, reset and field entry.
- Save to `localStorage` after changes; restore safely and tolerate malformed/old data.
- Single-select and multi-select option behavior.
- Maturity scoring 0–100 by option order; multi-select counts as answered with neutral maturity unless explicitly mapped.
- Finance calculations for monthly/annual loss and goal gap.
- Clipboard with fallback and toast.
- Print via `window.print()`.
- Confirmation before resetting a non-empty call.

## Verification

- No external runtime dependencies.
- No console errors.
- Keyboard activation uses native controls.
