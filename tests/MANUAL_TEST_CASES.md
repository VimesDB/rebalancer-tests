# Manual Test Cases - Portfolio Rebalancing Application

## 🌐 Global Preconditions (Default Baseline State)
Unless stated otherwise, every test case assumes the following starting conditions:
1.  **The application is opened** in a supported web browser.
2.  **Initial default values are loaded** exactly as follows:
    *   **Total Asset Value:** `$100,000`
    *   **IBM:** Target: `20%` | Current: `10%` | Unit Price: `$150`
    *   **MSFT:** Target: `20%` | Current: `20%` | Unit Price: `$90`
    *   **ORCL:** Target: `20%` | Current: `30%` | Unit Price: `$220`
    *   **AAPL:** Target: `20%` | Current: `20%` | Unit Price: `$450`
    *   **HD:** Target: `20%` | Current: `20%` | Unit Price: `$70`

---

### TC-01: Baseline Scenario Validation (Happy Path)
*   **Objective:** Verify that the system correctly calculates rebalancing share outputs using default sample data.
*   **Steps:**
    1. Click the "Calculate Rebalancing" button.
*   **Expected Result:**
    *   `IBM` Output displays `66.67` (Buy).
    *   `ORCL` Output displays `-45.45` (Sell).
    *   `MSFT`, `AAPL`, `HD` Outputs display `0`.

---

### TC-02: Live Variance Tracking (Functional UI)
*   **Objective:** Verify that changing allocation percentages dynamically recalculates the `Variance %` column in real-time.
*   **Steps:**
    1. Change `Current %` for `MSFT` from `20` to `40`.
*   **Expected Result:**
    *   `Variance %` for `MSFT` instantly updates to `20`.
    *   Total Allocation Tracker ("Current Allocation Total") at the top instantly updates to `120%`.

---

### TC-03: Validation Lock - Target Allocation Balance (Negative Path)
*   **Objective:** Verify that the application blocks calculation if the total Target % does not sum up to 100%.
*   **Steps:**
    1. Change `Target %` for `IBM` from `20` to `30` (Total Target becomes 110%).
*   **Expected Result:**
    *   An error message appears: `"Total Target % must equal exactly 100% (currently: 110%)"`.
    *   The "Calculate Rebalancing" button becomes disabled (`disabled` state).

---

### TC-04: Validation Lock - Current Allocation Balance (Negative Path)
*   **Objective:** Verify that the application blocks calculation if the total Current % does not sum up to 100%.
*   **Steps:**
    1. Change `Current %` for `IBM` from `10` to `5` (Total Current becomes 95%).
*   **Expected Result:**
    *   An error message appears: `"Total Current % must equal exactly 100% (currently: 95%)"`.
    *   The "Calculate Rebalancing" button becomes disabled (`disabled` state).

---

### TC-05: Strict Input Validation - Rejecting Text
*   **Objective:** Verify that the input fields strictly reject non-numeric/alphabetical entries.
*   **Steps:**
    1. Clear the `Total Asset Value ($)` input field.
    2. Try typing alphabetical letters like `abc` into the field.
*   **Expected Result:**
    *   The letters are ignored and not visible in the input box.
    *   The input box remains empty.

---

### TC-06: Strict Input Validation - Disallowing Negative Values
*   **Objective:** Verify that entering a negative value into any input triggers a validation error and blocks execution.
*   **Steps:**
    1. Enter `-150` into the `Unit Price ($)` field for `IBM`.
*   **Expected Result:**
    *   An error message appears: `"Negative values are not allowed in any field"`.
    *   The "Calculate Rebalancing" button is disabled.

---

### TC-07: Error Recovery Flow (State Transition)
*   **Objective:** Verify that the application clears validation errors and unlocks automatically once the user corrects the faulty data.
*   **Steps:**
    1. Change `Target %` for `IBM` to `30` to trigger a percentage error.
    2. Verify that the error message is visible and the button is disabled.
    3. Change `Target %` back to `20`.
*   **Expected Result:**
    *   The error message container completely disappears.
    *   The "Calculate Rebalancing" button is enabled and fully interactive again.

---

### TC-08: Empty Input Fields & Fallback Handling (Edge Case)
*   **Objective:** Verify that clearing out an input field completely doesn't crash the calculation script with `NaN` errors.
*   **Steps:**
    1. Clear out the `Unit Price ($)` field for `IBM` entirely (so it's empty).
    2. Click "Calculate Rebalancing".
*   **Expected Result:**
    *   The calculation executes successfully without crashing.
    *   The empty field is internally treated as `0` or handled gracefully by fallback logic (preventing application failure).

---

### TC-09: Extreme Numerical Scale / UI Layout Check (UX Boundary Case)
*   **Objective:** Verify that extremely large numbers do not break the visual layout of the application table.
*   **Steps:**
    1. Set `Total Asset Value ($)` to `999999999999` (Extremely large asset value).
    2. Click "Calculate Rebalancing".
*   **Expected Result:**
    *   Calculations complete accurately.
    *   The calculated output shares are readable and stay properly wrapped within their table columns without overlapping or clipping text.
