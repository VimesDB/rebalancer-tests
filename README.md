# Portfolio Rebalancing Calculator & Automation Suite

This project is a technical assessment solution designed to calculate and automate the testing of a financial portfolio rebalancing application. The application calculates the precise number of shares to buy or sell for a given set of securities to return their portfolio allocations to their target percentages.

## 📌 Business Logic & Mathematical Solution

Based on the technical assessment requirements for **Account ABC** with **\$100,000** in total vested assets, the initial baseline calculations to reach a zero target variance are:

- **IBM** (Target: 20%, Current: 10%, Variance: -10%, Price: \$150): **Buy 66.67 shares**
  - _Calculation:_ `($100,000 * 0.10 wariancji) / $150 = 66.666...`
- **ORCL** (Target: 20%, Current: 30%, Variance: +10%, Price: \$220): **Sell 45.45 shares**
  - _Calculation:_ `($100,000 * -0.10 wariancji) / $220 = -45.4545...`
- **MSFT, AAPL, HD** (Variance: 0%): **0.00 shares** (No rebalancing required)

---

## 🛠️ Tech Stack

- **Application:** HTML5, CSS3, Vanilla JavaScript (Editable layout for testing edge cases)
- **Test Automation:** Playwright, TypeScript
- **Local Server:** http-server (Node.js)

---

## 📂 Project Structure

```text
rebalancing-app/
├── tests/
│   └── rebalance.spec.ts  # Playwright E2E automated test cases (TypeScript)
├── index.html             # Core web application under test
├── package.json           # Project dependencies and test scripts
├── playwright.config.ts   # Global Playwright configuration & local webServer setup
├── README.md              # Project documentation
└── tsconfig.json          # TypeScript compilation setup
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org) installed on your machine.

### 2. Installation

Clone or navigate to the project directory and install Playwright with its required browser binaries:

```bash
npm init playwright@latest
```

_(When prompted, select **TypeScript**, use the default `tests` directory, and opt **true** for installing browsers)._

### 3. Running the Application Locally

To spin up the web server and interact with the application manually:

```bash
npx http-server . -p 8080
```

Once started, open your browser and navigate to: `http://127.0.0.1:8080`

---

## 🧪 Test Automation

The test automation suite leverages `data-testid` attributes embedded in the application UI to ensure robust and highly maintainable element selectors.

### Execution Commands

- **Run tests in Headless Mode (CLI):**

  ```bash
  npx playwright test
  ```

- **Run tests via Playwright UI Mode (Recommended for demo):**
  ```bash
  npx playwright test --ui
  ```

### Covered Automated Scenarios

1.  **Baseline Technical Assessment Validation:**
    - Validates the "Happy Path" by clicking calculate on default values and matching outputs exactly against the recruitment assignment calculations (IBM: `66.67`, ORCL: `-45.45`).
2.  **Dynamic Input & Live Re-calculation:**
    - Simulates real user interaction by clearing and updating fields (`Total Assets`, `Current %`, `Unit Price`), asserting that the `Variance %` recalculates dynamically on input change, and verifying math precision up to two decimal places after execution.
