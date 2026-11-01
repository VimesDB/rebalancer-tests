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

    await expectValidationErrorAndButtonDisabled("Total Target % must equal exactly 100%");
  });

  test("should display error and disable calculate button when total current percentage does not equal 100%", async () => {
    await rebalancePage.fillCurrentPercentage("IBM", "5");

    await expectValidationErrorAndButtonDisabled("Total Current % must equal exactly 100%");
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
    await expectValidationErrorAndButtonDisabled("Negative values are not allowed in any field");
    await expectValidationErrorAndButtonDisabled("Total Target % must equal exactly 100%");
  });

  test("should trigger both negative error and current percentage error for negative Current %", async () => {
    await rebalancePage.fillCurrentPercentage("MSFT", "-5");
    await expectValidationErrorAndButtonDisabled("Negative values are not allowed in any field");
    await expectValidationErrorAndButtonDisabled("Total Current % must equal exactly 100%");
  });

  test("should trigger negative error and lock button for negative Total Asset Value", async () => {
    await rebalancePage.fillTotalAsset("-100000");
    await expectValidationErrorAndButtonDisabled("Negative values are not allowed in any field");
    // We make sure it does NOT contain percentage errors, as percentages are still valid (100%)
    await expect(rebalancePage.getValidationErrorLocator()).not.toContainText(
      "Total Target % must equal exactly 100%",
    );
  });

  test("should trigger negative error and lock button for negative Unit Price", async () => {
    await rebalancePage.fillUnitPrice("ORCL", "-150");
    await expectValidationErrorAndButtonDisabled("Negative values are not allowed in any field");
    await expect(rebalancePage.getValidationErrorLocator()).not.toContainText(
      "Total Current % must equal exactly 100%",
    );
  });

  test("should clear error messages and enable calculate button when data is corrected by the user", async () => {
    await rebalancePage.fillTargetPercentage("HD", "30");

    await expectValidationErrorAndButtonDisabled("Total Target % must equal exactly 100%");

    await rebalancePage.fillTargetPercentage("HD", "20");

    await expect(rebalancePage.getValidationErrorLocator()).toBeHidden();

    await expect(rebalancePage.getCalculateButtonLocator()).toBeEnabled();
  });
});
