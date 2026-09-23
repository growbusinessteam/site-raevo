# Playbook Data Specification

## Overview

- Target file: `public/data/sales-playbook.json`
- Interaction model: data source for click-driven wizard
- Reference extracts:
  - `docs/research/blacksales-steps-raw.json`
  - `docs/research/blacksales-diagnostic-structured.json`
  - `docs/research/blacksales-objections.json`

## Required content

- Twelve stages with exact Portuguese titles, subtitles and stage-specific prompts from the extracts.
- Five diagnostic pillars with 30 question cards total:
  - Marketing e Captação: 7
  - Comercial e Conversão: 7
  - Gestão e Crescimento: 6
  - Autoridade e Imagem: 5
  - Produto e Monetização: 5
- Each question must include code, title, options, multi-select flag, optional extra fields, closer notes and perceived-pain selector.
- Six diagnostic tabs, including SPIN with four prompt groups.
- Eight objection categories and every extracted breaker response.
- Rapport prompts, pitch template, offer transition prompts and outcome/category lists.

## Data normalization

- Remove the trailing `Baixa`, `Média`, `Alta` controls from diagnostic option arrays; store them once as `painOptions`.
- Preserve option order because it determines maturity score.
- Generate stable lowercase ASCII ids for stages, pillars and questions.
- Keep all user-facing copy in Portuguese.

## Validation

- JSON must parse cleanly.
- Counts must match 12 stages, 30 diagnostic questions, 4 SPIN groups and 8 objection categories.
