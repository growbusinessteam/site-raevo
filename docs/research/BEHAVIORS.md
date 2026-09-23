# Raevo Sales Playbook — Behaviors

## Navigation

- Clicking any stage changes the main view without navigation or reload.
- Previous/next buttons change one stage at a time and are disabled at the ends.
- Header completion is stage progress: `(stage - 1) / 11`, rounded.
- Stage rail shows current, completed and future states.

## Data entry

- Text, number, date, select and textarea values update immediately.
- Single-choice diagnostic answers behave as radio groups.
- Multi-choice diagnostic answers toggle independently.
- Every diagnostic card also records perceived pain (Baixa, Média, Alta), closer notes and optional contextual fields.
- Procedure rows can be added and removed; totals recalculate immediately.
- Data is saved locally after every change.

## Calculations

- Maturity options map left-to-right from critical to healthy.
- Pillar score is the average of answered maturity questions.
- Fill percentage is answered diagnostic cards divided by total cards.
- Clinic health is the average of the five pillar scores.
- Monthly loss combines missed consultations and missed procedures.
- Annual loss is monthly loss × 12.
- Revenue gap is `max(goal - current revenue, 0)`.

## Generated content

- Stages 7–10 and 12 regenerate from the live call data.
- Copy buttons send the current generated block to the clipboard and show a toast.
- Objection-breaker copy substitutes doctor, goal, monthly/annual loss, desired state, time and inertia consequence.
- “Gerar PDF” opens the browser print flow with a report-only print layout suitable for saving as PDF.

## Feedback and accessibility

- Selected options receive a gold border/background.
- Buttons have visible hover and focus states.
- Toast messages confirm copied content, saved report and reset.
- All inputs have programmatic labels; navigation and diagnostic tabs expose selected state.

## Responsive

- Desktop: persistent 188 px sidebar; main header/footer remain visible while content scrolls.
- Tablet: reduced gutters and two-column cards where space permits.
- Mobile: stage navigation becomes a horizontal rail; header actions wrap; field grids stack; footer buttons remain reachable.
