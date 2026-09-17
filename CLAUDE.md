# GeoSolver Frontend Instructions

This repository contains the GeoSolver web application.

Current stack must be taken from package.json, not assumptions.

Current code is JavaScript/JSX, not TypeScript.

## Architecture

Geodetic calculation logic belongs in:

src/domain/geodesy/
src/domain/math/

UI components should consume domain functions rather than reimplement formulas.

Do not embed new mathematical formulas directly in React components if a domain-layer implementation is appropriate.

## API

Do not introduce another ad-hoc authenticated fetch wrapper.

When API client work is intentionally addressed, prefer consolidation rather than creating more duplicated auth/header handling.

Maintain compatibility with geosolver-backend.

Do not invent backend endpoints.

## Projects

Project-aware functionality should gradually converge around the existing project/workspace model.

Future Calculation and Capture integration should attach to projects without breaking standalone calculator workflows unless explicitly approved.

## OCR/Capture

Current OCR UI is legacy/narrow and should not be copied to additional calculators as-is.

Future OCR should use a reusable Capture architecture.

UI must support:
- editable recognized values
- per-field confidence
- review state
- recognition errors
- original vs corrected value
- clear human confirmation for uncertain data

Never silently insert low-confidence OCR data into a verified calculation.

## Calculations

Do not casually modify formulas.

Tests are mandatory for new or changed geodetic calculation logic.

Existing untested calculation modules should be validated before being treated as reference implementations.

## UX

Bulgarian is a primary product language.

Do not introduce untranslated production-visible text.

Preserve responsive behavior and existing workflows unless the task explicitly changes them.

## Safety

Do not expose secrets.
Do not modify production deployment settings without instruction.
Do not commit/push automatically.
