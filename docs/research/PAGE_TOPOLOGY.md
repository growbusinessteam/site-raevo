# Raevo Sales Playbook — Page Topology

## Reference

- Source inspected: `https://vendas.blacksalesmed.com/`
- Product type: single-page sales-call assistant for medical-clinic closers
- Interaction model: click-driven 12-step wizard with live calculations, generated scripts, clipboard actions, report printing and call reset

## Global layout

1. Fixed left navigation with product mark, 12 numbered stages and progress.
2. Main work area with:
   - compact top bar (current stage, completion percentage and “Nova call”);
   - scrollable stage content;
   - fixed previous/next navigation footer.
3. Dark graphite visual system with gold accent, Inter body type and Playfair Display headings.

## Stages

1. **Pré-call / Ficha Inicial** — doctor, clinic, lead and call metadata.
2. **Rapport** — profile research notes and five opening prompts.
3. **Abertura** — motivation for taking the call.
4. **Diagnóstico** — operational context, maturity dashboard, five diagnostic pillars and SPIN prompt library.
5. **Metas** — ideal future, challenges, financial inputs and repeatable procedure rows.
6. **Dores** — time with problem, attempted solutions, losses and inertia consequence.
7. **Stack Dor** — generated pain/desire stack with monthly and annual loss estimate.
8. **Plano** — inefficiency calculation and ranked bottleneck report.
9. **Pitch** — generated Heaven × Hell transition script.
10. **Oferta** — executive summary, commercial ammunition and transition lines.
11. **Fechamento** — objection classification, outcome, next step and expandable objection-breaker library.
12. **Resumo** — consolidated client sheet, diagnostic health, finances, objections, outcome, print/PDF and copy actions.

## Responsive behavior

- Reference desktop uses a 159 px sidebar and a flexible main work area.
- Reference mobile keeps the sidebar visible, leaving only 231 px for the main at 390 px viewport.
- The Raevo implementation keeps the visual system and workflow but improves mobile usability: the sidebar becomes a horizontally scrollable stage rail and the content uses the full viewport width.

## State

- All fields update a central call object.
- State is persisted in `localStorage` so an accidental refresh does not lose the call.
- “Nova call” resets the state after confirmation when data exists.
- Diagnostic scores are derived from selected option maturity values and reported per pillar.
- Generated scripts substitute doctor name, revenue, goal, pain and time data.
