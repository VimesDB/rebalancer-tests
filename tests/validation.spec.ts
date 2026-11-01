import { test, expect } from "@playwright/test";
import { RebalancePage } from "./pages/RebalancePage";

test.describe("Portfolio Rebalancing Calculator - Data Validation Tests", () => {
  let rebalancePage: RebalancePage;

  const expectValidationErrorAndButtonDisabled = async (message: string) => {
    await expect(rebalancePage.getValidationErrorLocator()).toBeVisible();
    await expect(rebalancePage.getValidationErrorLocator()).toContainText(
      message,
    );
    await expect(rebalancePage.getCalculateButtonLocator()).toBeDisabled();
  };

  test.beforeEach(async ({ page }) => {
    rebalancePage = new RebalancePage(page);
    await rebalancePage.navigate();
  });

  test("should display error and disable calculate button when total target percentage does not equal 100%", async () => {
    await rebalancePage.fillTargetPercentage("IBM", "30");

    await expectValidationErrorAndButtonDisabled(
      "Total Target % must equal exactly 100%",
    );
  });

  test("should display error and disable calculate button when total current percentage does not equal 100%", async () => {
    await rebalancePage.fillCurrentPercentage("IBM", "5");

    await expectValidationErrorAndButtonDisabled(
      "Total Current % must equal exactly 100%",
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

  test("should accept positive numbers, reject text characters and trigger error for negative values", async () => {
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
      await expect(inputField).toHaveValue(""); // Should remain empty because 'abc' is natively rejected

      await inputField.fill("-5");
      await expectValidationErrorAndButtonDisabled(
        "Negative values are not allowed in any field",
      );

      await inputField.fill("20");
    }
  });

  test("should block calculate button, trigger negative and target percentage error for negative Target %", async () => {
    await rebalancePage.fillTargetPercentage("IBM", "-5");
    await expectValidationErrorAndButtonDisabled(
      "Negative values are not allowed in any field",
    );
    await expectValidationErrorAndButtonDisabled(
      "Total Target % must equal exactly 100%",
    );
  });

  test("should trigger both negative error and current percentage error for negative Current %", async () => {
    await rebalancePage.fillCurrentPercentage("MSFT", "-5");
    await expectValidationErrorAndButtonDisabled(
      "Negative values are not allowed in any field",
    );
    await expectValidationErrorAndButtonDisabled(
      "Total Current % must equal exactly 100%",
    );
  });

  test("should trigger negative error and lock button for negative Total Asset Value", async () => {
    await rebalancePage.fillTotalAsset("-100000");
    await expectValidationErrorAndButtonDisabled(
      "Negative values are not allowed in any field",
    );
    // We make sure it does NOT contain percentage errors, as percentages are still valid (100%)
    await expect(rebalancePage.getValidationErrorLocator()).not.toContainText(
      "Total Target % must equal exactly 100%",
    );
  });

  test("should trigger negative error and lock button for negative Unit Price", async () => {
    await rebalancePage.fillUnitPrice("ORCL", "-150");
    await expectValidationErrorAndButtonDisabled(
      "Negative values are not allowed in any field",
    );
    await expect(rebalancePage.getValidationErrorLocator()).not.toContainText(
      "Total Current % must equal exactly 100%",
    );
  });

  test("should clear error messages and enable calculate button when data is corrected by the user", async () => {
    await rebalancePage.fillTargetPercentage("HD", "30");

    await expectValidationErrorAndButtonDisabled(
      "Total Target % must equal exactly 100%",
    );

    await rebalancePage.fillTargetPercentage("HD", "20");

    await expect(rebalancePage.getValidationErrorLocator()).toBeHidden();

    await expect(rebalancePage.getCalculateButtonLocator()).toBeEnabled();
  });

  test("should accept decimal percentages when total target and current remain exactly 100%", async () => {
    await rebalancePage.fillTargetPercentage("IBM", "10.5");
    await rebalancePage.fillTargetPercentage("MSFT", "19.5");
    await rebalancePage.fillTargetPercentage("ORCL", "20");
    await rebalancePage.fillTargetPercentage("AAPL", "25");
    await rebalancePage.fillTargetPercentage("HD", "25");

    await expect(rebalancePage.getCalculateButtonLocator()).toBeEnabled();

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
    await expect(rebalancePage.getCalculateButtonLocator()).toBeDisabled();
  });

  test("should not crash when a unit price field is cleared", async () => {
    const ibmOutput = rebalancePage.getOutputLocator("IBM");

    await rebalancePage.fillUnitPrice("IBM", "");
    await rebalancePage.clickCalculate();

    await expect(rebalancePage.getCalculateButtonLocator()).toBeEnabled();
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

    await expect(rebalancePage.getValidationErrorLocator()).toBeHidden();
    await expect(rebalancePage.getCalculateButtonLocator()).toBeEnabled();
  });

  test("should re-enable calculation after invalid values are corrected step by step", async () => {
    await rebalancePage.fillTargetPercentage("IBM", "30");
    await expect(rebalancePage.getValidationErrorLocator()).toContainText(
      "Total Target % must equal exactly 100%",
    );
    await expect(rebalancePage.getCalculateButtonLocator()).toBeDisabled();

    await rebalancePage.fillTargetPercentage("IBM", "20");
    await rebalancePage.fillCurrentPercentage("MSFT", "5");
    await expect(rebalancePage.getValidationErrorLocator()).toContainText(
      "Total Current % must equal exactly 100%",
    );

    await rebalancePage.fillCurrentPercentage("MSFT", "20");
    await expect(rebalancePage.getValidationErrorLocator()).toBeHidden();
    await expect(rebalancePage.getCalculateButtonLocator()).toBeEnabled();
  });
});
