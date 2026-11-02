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
  - `IBM` Output displays `66.67` (Buy).
  - `ORCL` Output displays `-45.45` (Sell).
  - `MSFT`, `AAPL`, `HD` Outputs display `0`.

---

### TC-02: Live Variance Tracking

- **Objective:** Verify that changing allocation percentages dynamically recalculates the `Variance %` column in real-time.
- **Steps:**
  1. Change `Current %` for `MSFT` from `20` to `40`.
- **Expected Result:**
  - `Variance %` for `MSFT` instantly updates to `20`.
  - Total Allocation Tracker ("Current Allocation Total") at the top instantly updates to `120%`.

---

### TC-03: Validation Lock - Target Allocation Balance (Negative Path)

- **Objective:** Verify that the application blocks calculation if the total Target % does not sum up to 100%.
- **Steps:**
  1. Change `Target %` for `IBM` from `20` to `30` (Total Target becomes 110%).
- **Expected Result:**
  - An error message appears: `"Total Target % must equal exactly 100% (currently: 110%)"`.
  - The "Calculate Rebalancing" button becomes disabled (`disabled` state).

---

### TC-04: Validation Lock - Current Allocation Balance

- **Objective:** Verify that the application blocks calculation if the total Current % does not sum up to 100%.
- **Steps:**
  1. Change `Current %` for `IBM` from `10` to `5` (Total Current becomes 95%).
- **Expected Result:**
  - An error message appears: `"Total Current % must equal exactly 100% (currently: 95%)"`.
  - The "Calculate Rebalancing" button becomes disabled (`disabled` state).

---

### TC-05: Strict Input Validation - Rejecting Text

- **Objective:** Verify that the input fields strictly reject non-numeric/alphabetical entries.
- **Steps:**
  1. Clear the `Total Asset Value ($)` input field.
  2. Try typing alphabetical letters like `abc` into the field.
- **Expected Result:**
  - The letters are ignored and not visible in the input box.
  - The input box remains empty.

---

### TC-06: Strict Input Validation - Disallowing Negative Values

- **Objective:** Verify that entering a negative value into any input triggers a validation error and blocks execution.
- **Steps:**
  1. Enter `-150` into the `Unit Price ($)` field for `IBM`.
- **Expected Result:**
  - An error message appears: `"Negative values are not allowed in any field"`.
  - The "Calculate Rebalancing" button is disabled.

---

### TC-07: Error Recovery Flow

- **Objective:** Verify that the application clears validation errors and unlocks automatically once the user corrects the faulty data.
- **Steps:**
  1. Change `Target %` for `IBM` to `30` to trigger a percentage error.
  2. Verify that the error message is visible and the button is disabled.
  3. Change `Target %` back to `20`.
- **Expected Result:**
  - The error message container completely disappears.
  - The "Calculate Rebalancing" button is enabled and fully interactive again.

---

### TC-08: Empty Input Fields & Fallback Handling

- **Objective:** Verify that clearing out an input field completely doesn't crash the calculation script with `NaN` errors.
- **Steps:**
  1. Clear out the `Unit Price ($)` field for `IBM` entirely (so it's empty).
  2. Click "Calculate Rebalancing".
- **Expected Result:**
  - The calculation executes successfully without crashing.
  - The empty field is internally treated as `0` or handled gracefully by fallback logic (preventing application failure).

---

### TC-09: Combined Validation Errors

- **Objective:** Verify that multiple invalid states can be displayed simultaneously and block calculation.
- **Steps:**
  1. Set `Total Asset Value ($)` to `-1000`.
  2. Change `Target %` for `IBM` to `30`.
  3. Change `Current %` for `MSFT` to `5`.
- **Expected Result:**
  - The validation panel contains both: `Negative values are not allowed in any field` and percentage balance errors.
  - The `Calculate Rebalancing` button remains disabled.
  - The UI clearly indicates that more than one issue exists at the same time.

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
  - No validation error is shown.
  - The button stays enabled and the calculation completes successfully.
  - Decimal-based output values are rendered without truncation or rounding issues.

---

### TC-11: Error Recovery - Step-by-Step Correction

- **Objective:** Verify that validation errors clear only after all invalid states are fixed, in the right order.
- **Steps:**
  1. Set `Target %` for `IBM` to `20.01` to create a percentage imbalance.
  2. Confirm the validation error is visible and the button is disabled.
  3. Change `Target %` for `IBM` back to `20`.
  4. Change `Current %` for `MSFT` to `5`.
  5. Confirm the current-allocation validation error appears and the button remains disabled.
  6. Change `Current %` for `MSFT` back to `20`.
- **Expected Result:**
  - The validation message disappears only after the final invalid field is corrected.
  - The button becomes enabled again only when all validation conditions pass.

---

### TC-12: Extreme Numerical Scale / UI Layout Check

- **Objective:** Verify that extremely large numbers do not break the visual layout of the application table.
- **Steps:**
  1. Set `Total Asset Value ($)` to `999999999999` (Extremely large asset value).
  2. Click "Calculate Rebalancing".
- **Expected Result:**
  - Calculations complete accurately.
  - The calculated output shares are readable and stay properly wrapped within their table columns without overlapping or clipping text.
