# Portfolio Rebalancing Calculator - Test Suite

This repository contains a Playwright + TypeScript automation suite for a small portfolio rebalancing calculator. The project focuses on verifying business rules, validation flows and core recalculation behavior against the app served locally via `http-server`.

---

## Overview

The app under test is a local HTML/JS page that allows users to:

- input total portfolio value,
- edit target and current percentages per security,
- edit unit prices,
- calculate rebalancing output,
- receive validation feedback when the portfolio totals are invalid.

The automated suite covers both:

- functional calculation checks,
- validation and edge-case scenarios.

---

## Project Structure

```text
rebalancer-tests/
├── index.html
├── package.json
├── playwright.config.ts
├── README.md
├── playwright-report/
├── test-results/
├── tests/
│   ├── MANUAL_TEST_CASES.md
│   ├── rebalance.spec.ts
│   ├── validation.spec.ts
│   └── pages/
│       └── RebalancePage.ts
├── node_modules/
└── .gitignore
```

### Main test files

- `tests/validation.spec.ts` - validation, edge cases, negative values, empty states, recovery flow
- `tests/rebalance.spec.ts` - baseline functional checks and recalculation behavior
- `tests/pages/RebalancePage.ts` - page object model for stable selectors and repeated interactions
- `tests/MANUAL_TEST_CASES.md` - manual scenarios for QA and exploration

---

## Tech Stack

- Playwright
- TypeScript
- HTML / Vanilla JS app under test
- Node.js
- `http-server` for local app serving

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Install Playwright browsers

```bash
npx playwright install
```

---

## Running the App

The app is served directly from the repository root on port 8080.

```bash
npx http-server . -p 8080
```

Then open:

```text
http://127.0.0.1:8080
```

---

## Running the Tests

### All tests

```bash
npx playwright test
```

### Specific suite

```bash
npx playwright test tests/validation.spec.ts
npx playwright test tests/rebalance.spec.ts
```

### Headed mode

```bash
npx playwright test --headed
```

### UI mode

```bash
npx playwright test --ui
```

### Line reporter

```bash
npx playwright test tests/validation.spec.ts tests/rebalance.spec.ts --reporter=line
```

---

## What is Covered

### Validation coverage

- total target percentage must equal exactly 100%
- total current percentage must equal exactly 100%
- negative values are rejected
- non-numeric values are rejected
- output / variance cells remain read-only
- invalid values can recover after correction
- combined validation errors are shown together
- empty unit-price fallback is handled without breaking the UI
- large values and zero values are treated consistently

### Functional coverage

- default calculation output matches expected portfolio result
- recalculation updates after changing inputs
- output formatting remains stable at two decimal places

---

## Business Assumptions

These assumptions are intentionally documented so the tests remain deterministic and clear.

- Default app state uses a total asset value of $100,000.
- The total target percentage must equal exactly 100%.
- The total current percentage must equal exactly 100%.
- Negative values in editable fields are rejected and block calculation.
- Non-numeric text is not retained as a value.
- Zero is considered valid if the totals remain balanced.
- Decimal percentages are accepted when the total remains exactly 100%.
- Once invalid values are corrected, validation disappears and the calculate button becomes enabled again.
- Very large numeric values are treated as valid if the UI remains stable and no product restriction says otherwise.
- No explicit product requirement currently defines a maximum character count for inputs.
- Fractional share outputs and decimal percentage inputs are accepted unless the product owner explicitly restricts them.

---

## Open Questions / Product Decisions

These are the main product decisions that should be clarified if the business rules become stricter:

1. Should there be a maximum allowed input length for numeric fields?
2. Are fractional shares allowed everywhere, or only in specific calculations?
3. Should the UI reject decimal percentages beyond a defined precision?
4. Should the app allow empty unit prices only as a fallback, or treat them as invalid in all cases?

These are currently treated as assumptions rather than hard product requirements.

---
