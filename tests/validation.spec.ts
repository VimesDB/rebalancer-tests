import { test, expect } from "@playwright/test";
import { RebalancePage } from "./pages/RebalancePage";

test.describe("Portfolio Rebalancing Calculator - Data Validation Tests", () => {
  let rebalancePage: RebalancePage;

  const expectCalculateButtonState = async (status: "enabled" | "disabled") => {
    if (status === "disabled") {
      await expect(rebalancePage.getCalculateButtonLocator()).toBeDisabled();
      return;
    }

    await expect(rebalancePage.getCalculateButtonLocator()).toBeEnabled();
  };

  const expectValidationErrorAndButtonDisabled = async (message: string) => {
    await expect(rebalancePage.getValidationErrorLocator()).toBeVisible();
    await expect(rebalancePage.getValidationErrorLocator()).toContainText(
      message,
    );
    await expectCalculateButtonState("disabled");
  };

  const expectNoValidationError = async () => {
    await expect(rebalancePage.getValidationErrorLocator()).toBeHidden();
    await expectCalculateButtonState("enabled");
  };

  test.beforeEach(async ({ page }) => {
    rebalancePage = new RebalancePage(page);
    await rebalancePage.navigate();
  });

  test("should block calculation when total target percentage is not 100%", async () => {
    await expectNoValidationError();

    await rebalancePage.fillTargetPercentage("IBM", "21");

    await expectValidationErrorAndButtonDisabled(
      "Total Target % must equal exactly 100% (currently: 101%)",
    );
  });

  test("should block calculation when total current percentage is not 100%", async () => {
    await expectNoValidationError();

    await rebalancePage.fillCurrentPercentage("IBM", "9.9");

    await expectValidationErrorAndButtonDisabled(
      "Total Current % must equal exactly 100% (currently: 99.9%)",
    );
  });

  test("should guarantee that Variance and Output cells are strictly read-only", async ({
    page,
  }) => {
    const varianceCell = rebalancePage.getVarianceLocator("IBM");
    const outputCell = rebalancePage.getOutputLocator("IBM");

    await expect(varianceCell).not.toHaveAttribute("editable", "true");
    await expect(outputCell).not.toHaveAttribute("editable", "true");

    await varianceCell.click();
    await expect(varianceCell).not.toBeFocused();

    await outputCell.click();
    await expect(outputCell).not.toBeFocused();

    await expect(page.locator("body")).toBeFocused();
  });

  test("should reject non-numeric text input in editable fields", async () => {
    const fieldsToTest = [
      rebalancePage.getTotalAssetInputLocator(),
      rebalancePage.getTargetInputLocator("IBM"),
      rebalancePage.getCurrentInputLocator("HD"),
      rebalancePage.getPriceInputLocator("AAPL"),
    ];

    for (const inputField of fieldsToTest) {
      await inputField.fill("25");
      await expect(inputField).toHaveValue("25");

      await inputField.clear();
      await inputField.pressSequentially("abc");
      await expect(inputField).toHaveValue("");

      await inputField.fill("20");
    }
  });

  test("should reject negative values across supported input types", async () => {
    const cases = [
      {
        action: () => rebalancePage.fillTargetPercentage("IBM", "-5"),
        extraError: "Total Target % must equal exactly 100%",
      },
      {
        action: () => rebalancePage.fillCurrentPercentage("MSFT", "-5"),
        extraError: "Total Current % must equal exactly 100%",
      },
      {
        action: () => rebalancePage.fillTotalAsset("-100000"),
        extraError: null,
      },
      {
        action: () => rebalancePage.fillUnitPrice("ORCL", "-150"),
        extraError: null,
      },
    ];

    for (const testCase of cases) {
      await rebalancePage.navigate();
      await testCase.action();

      await expectValidationErrorAndButtonDisabled("Negative values are not allowed in any field");

      if (testCase.extraError) {
        await expectValidationErrorAndButtonDisabled(testCase.extraError);
      }
    }
  });

  test("should clear validation error after user corrects the data", async () => {
    await expectNoValidationError();

    await rebalancePage.fillTargetPercentage("HD", "30");
    await expectValidationErrorAndButtonDisabled(
      "Total Target % must equal exactly 100%",
    );

    await rebalancePage.fillTargetPercentage("HD", "20");
    await expectNoValidationError();
  });

  test("should accept decimal percentages when total remains exactly 100%", async () => {
    await expectNoValidationError();

    await rebalancePage.fillTargetPercentage("IBM", "10.5");
    await rebalancePage.fillTargetPercentage("MSFT", "19.5");
    await rebalancePage.fillTargetPercentage("ORCL", "20");
    await rebalancePage.fillTargetPercentage("AAPL", "25");
    await rebalancePage.fillTargetPercentage("HD", "25");

    await expectCalculateButtonState("enabled");

    await rebalancePage.clickCalculate();

    await expect(rebalancePage.getOutputLocator("IBM")).toHaveText("3.33");
    await expect(rebalancePage.getOutputLocator("MSFT")).toHaveText("-5.56");
  });

  test("should show combined validation errors when multiple invalid states exist at once", async () => {
    await rebalancePage.fillTotalAsset("-1000");
    await rebalancePage.fillTargetPercentage("IBM", "30");
    await rebalancePage.fillCurrentPercentage("MSFT", "5");

    await expect(rebalancePage.getValidationErrorLocator()).toBeVisible();
    await expect(rebalancePage.getValidationErrorLocator()).toContainText(
      "Negative values are not allowed in any field",
    );
    await expect(rebalancePage.getValidationErrorLocator()).toContainText(
      "Total Target % must equal exactly 100%",
    );
    await expect(rebalancePage.getValidationErrorLocator()).toContainText(
      "Total Current % must equal exactly 100%",
    );
    await expectCalculateButtonState("disabled");
  });

  test("should not crash when a unit price field is cleared", async () => {
    const ibmOutput = rebalancePage.getOutputLocator("IBM");

    await rebalancePage.fillUnitPrice("IBM", "");
    await rebalancePage.clickCalculate();

    await expectCalculateButtonState("enabled");
    // Assert that the output is a valid formatted number (positive, negative, or zero)
    // and NOT a broken technical string like 'NaN' or 'Infinity' due to a zero/empty fallback division.
    await expect(ibmOutput).toHaveText(/^-?\d+(\.\d+)?$/);
  });

  test("should handle large numeric values without breaking calculation or layout", async () => {
    await rebalancePage.fillTotalAsset("999999999999");
    await rebalancePage.clickCalculate();

    await expect(rebalancePage.getOutputLocator("IBM")).toHaveText(
      "666666666.67",
    );
    await expect(rebalancePage.getOutputLocator("ORCL")).toHaveText(
      "-454545454.54",
    );
  });

  test("should treat zero values as valid when total percentages remain balanced", async () => {
    await expectNoValidationError();

    await rebalancePage.fillTargetPercentage("IBM", "0");
    await rebalancePage.fillCurrentPercentage("IBM", "0");
    await rebalancePage.fillTargetPercentage("MSFT", "25");
    await rebalancePage.fillCurrentPercentage("MSFT", "25");
    await rebalancePage.fillTargetPercentage("ORCL", "25");
    await rebalancePage.fillCurrentPercentage("ORCL", "25");
    await rebalancePage.fillTargetPercentage("AAPL", "25");
    await rebalancePage.fillCurrentPercentage("AAPL", "25");
    await rebalancePage.fillTargetPercentage("HD", "25");
    await rebalancePage.fillCurrentPercentage("HD", "25");

    await expectNoValidationError();
  });

  test("should re-enable calculation after invalid values are corrected step by step", async () => {
    await rebalancePage.fillTargetPercentage("IBM", "20.01");
    await expectValidationErrorAndButtonDisabled(
      "Total Target % must equal exactly 100% (currently: 100.01%)",
    );

    await rebalancePage.fillTargetPercentage("IBM", "20");
    await rebalancePage.fillCurrentPercentage("MSFT", "5");
    await expectValidationErrorAndButtonDisabled(
      "Total Current % must equal exactly 100% (currently: 85%)",
    );

    await rebalancePage.fillCurrentPercentage("MSFT", "20");
    await expectNoValidationError();
  });
});
