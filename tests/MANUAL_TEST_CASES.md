# Manual Test Cases - Portfolio Rebalancing Application

## Global Preconditions (Default Baseline State)

Unless stated otherwise, every test case assumes the following starting conditions:

1.  **The application is opened** in a supported web browser.
2.  **Initial default values are loaded** exactly as follows:
    - **Total Asset Value:** `$100,000`
    - **IBM:** Target: `20%` | Current: `10%` | Unit Price: `$150`
    - **MSFT:** Target: `20%` | Current: `20%` | Unit Price: `$90`
    - **ORCL:** Target: `20%` | Current: `30%` | Unit Price: `$220`
    - **AAPL:** Target: `20%` | Current: `20%` | Unit Price: `$450`
    - **HD:** Target: `20%` | Current: `20%` | Unit Price: `$70`

---

### TC-01: Baseline Scenario Validation

- **Objective:** Verify that the system correctly calculates rebalancing share outputs using default sample data.
- **Steps:**
  1. Click the "Calculate Rebalancing" button.
- **Expected Result:**
  - The "Calculate Rebalancing" button is enabled before click.
  - `IBM` output displays `66.67` (buy).
  - `ORCL` output displays `-45.45` (sell).
  - `MSFT`, `AAPL` and `HD` outputs display `0.00`.

---

### TC-02: Live Variance Tracking

- **Objective:** Verify that changing allocation percentages dynamically recalculates the `Variance %` column in real time.
- **Steps:**
  1. Change `Current %` for `MSFT` from `20` to `40`.
- **Expected Result:**
  - `Variance %` for `MSFT` instantly updates to `20`.
  - Total Allocation Tracker ("Current Allocation Total") at the top instantly updates to `120%`.

---

### TC-03: Validation Lock - Target Allocation Balance (Negative Path)

- **Objective:** Verify that the application blocks calculation if the total target percentage is not exactly `100%`.
- **Steps:**
  1. Change `Target %` for `IBM` from `20` to `30` (Total Target becomes 110%).
- **Expected Result:**
  - Validation message is visible and contains exactly: `Total Target % must equal exactly 100% (currently: 110%)`.
  - The "Calculate Rebalancing" button is disabled.

---

### TC-04: Validation Lock - Current Allocation Balance

- **Objective:** Verify that the application blocks calculation if the total current percentage is not exactly `100%`.
- **Steps:**
  1. Change `Current %` for `IBM` from `10` to `5` (Total Current becomes 95%).
- **Expected Result:**
  - Validation message is visible and contains exactly: `Total Current % must equal exactly 100% (currently: 95%)`.
  - The "Calculate Rebalancing" button is disabled.

---

### TC-05: Strict Input Validation - Rejecting Text

- **Objective:** Verify that non-numeric text is rejected and not persisted in editable fields.
- **Steps:**
  1. Clear the `Total Asset Value ($)` input.
  2. Type `abc` into the field.
- **Expected Result:**
  - The field value remains empty.
  - No validation error appears while the default portfolio totals remain valid.

---

### TC-06: Strict Input Validation - Disallowing Negative Values

- **Objective:** Verify that entering a negative value into any editable field blocks the calculation.
- **Steps:**
  1. Enter `-150` into the `Unit Price ($)` field for `IBM`.
- **Expected Result:**
  - Validation message is visible and contains exactly: `Negative values are not allowed in any field`.
  - The "Calculate Rebalancing" button is disabled.

---

### TC-07: Error Recovery Flow

- **Objective:** Verify that validation errors clear only after the incorrect value is corrected.
- **Steps:**
  1. Change `Target %` for `IBM` to `30`.
  2. Confirm the error is visible and the button is disabled.
  3. Change `Target %` back to `20`.
- **Expected Result:**
  - After step 1: validation message contains `Total Target % must equal exactly 100% (currently: 110%)` and the button is disabled.
  - After step 3: validation message disappears and the "Calculate Rebalancing" button is enabled again.

---

### TC-08: Empty Input Fields & Fallback Handling

- **Objective:** Verify that clearing a numeric field does not produce broken output or crash the app.
- **Steps:**
  1. Clear the `Unit Price ($)` field for `IBM`.
  2. Click "Calculate Rebalancing".
- **Expected Result:**
  - The calculation executes successfully without crashing.
  - The empty field is internally treated as `0` or handled gracefully by fallback logic (preventing application failure).
  - The "Calculate Rebalancing" button remains enabled.

---

### TC-09: Combined Validation Errors

- **Objective:** Verify that multiple invalid states are shown together and block calculation.
- **Steps:**
  1. Set `Total Asset Value ($)` to `-1000`.
  2. Change `Target %` for `IBM` to `30`.
  3. Change `Current %` for `MSFT` to `5`.
- **Expected Result:**
  - Validation message contains: `Negative values are not allowed in any field`.
  - Validation message also contains: `Total Target % must equal exactly 100%`.
  - Validation message also contains: `Total Current % must equal exactly 100%`.
  - The "Calculate Rebalancing" button remains disabled.

---

### TC-10: Decimal Allocation Acceptance

- **Objective:** Verify that decimal percentages are accepted when the total remains exactly `100%`.
- **Steps:**
  1. Set `Target %` for `IBM` to `10.5`.
  2. Set `Target %` for `MSFT` to `19.5`.
  3. Set `Target %` for `ORCL` to `20`.
  4. Set `Target %` for `AAPL` to `25`.
  5. Set `Target %` for `HD` to `25`.
  6. Click "Calculate Rebalancing".
- **Expected Result:**
  - No validation error is visible.
  - The "Calculate Rebalancing" button stays enabled.
  - After click, `IBM` output is `3.33` and `MSFT` output is `-5.56`.
  - Repeat the scenario for the comma (19,5) and the dot (19.5)

---

### TC-11: Error Recovery - Step-by-Step Correction

- **Objective:** Verify that validation errors clear only after all invalid states are fixed in the correct order.
- **Steps:**
  1. Set `Target %` for `IBM` to `20.01`.
  2. Confirm the percentage error is visible and the button is disabled.
  3. Set `Target %` for `IBM` back to `20`.
  4. Confirm the percentage error is NOT visible and the button is ENABLED.
  5. Set `Current %` for `MSFT` to `5`.
  6. Confirm the current percentage error appears and the button remains disabled.
  7. Set `Current %` for `MSFT` back to `20`.
- **Expected Result:**
  - After step 1: validation message contains `Total Target % must equal exactly 100% (currently: 100.01%)` and the button is disabled.
  - After step 5: validation message contains `Total Current % must equal exactly 100% (currently: 85%)` and the button is disabled.
  - After step 7: validation message disappears and the button is enabled.

---

### TC-12: Extreme Numerical Scale / UI Layout Check

- **Objective:** Verify that extremely large values do not break the calculation or table layout.
- **Steps:**
  1. Set `Total Asset Value ($)` to `999999999999`.
  2. Click "Calculate Rebalancing".
- **Expected Result:**
  - Calculations complete accurately.
  - The calculated output shares are readable and stay properly wrapped within their table columns without overlapping or clipping text.
