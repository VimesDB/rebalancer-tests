import { test, expect } from "@playwright/test";
import { RebalancePage } from "./pages/RebalancePage";

test.describe("Portfolio Rebalancing Calculator - Functional Happy Path", () => {
  let rebalancePage: RebalancePage;

  test.beforeEach(async ({ page }) => {
    rebalancePage = new RebalancePage(page);
    await rebalancePage.navigate();
  });

  test("should correctly calculate rebalancing for default values", async () => {
    await rebalancePage.clickCalculate();

    await expect(rebalancePage.getOutputLocator("IBM")).toHaveText("66.67");
    await expect(rebalancePage.getOutputLocator("ORCL")).toHaveText("-45.45");
    await expect(rebalancePage.getOutputLocator("MSFT")).toHaveText("0");
    await expect(rebalancePage.getOutputLocator("AAPL")).toHaveText("0");
    await expect(rebalancePage.getOutputLocator("HD")).toHaveText("0");
  });

  test("should dynamically calculate variance and update output shares when inputs change", async () => {   
    await rebalancePage.fillTotalAsset("200000");
    await rebalancePage.clickCalculate();

    await expect(rebalancePage.getOutputLocator("ORCL")).toHaveText("-90.91");
    await expect(rebalancePage.getOutputLocator("MSFT")).toHaveText("0");

    await rebalancePage.fillCurrentPercentage("MSFT", "40");
    await rebalancePage.fillCurrentPercentage("ORCL", "10");

    await expect(rebalancePage.getVarianceLocator("MSFT")).toHaveText("20");
    await expect(rebalancePage.getVarianceLocator("ORCL")).toHaveText("-10");

    await rebalancePage.clickCalculate();
    await expect(rebalancePage.getOutputLocator("MSFT")).toHaveText("-444.44");
    await expect(rebalancePage.getOutputLocator("ORCL")).toHaveText("90.91");

    await rebalancePage.fillUnitPrice("MSFT", "100");
    await rebalancePage.clickCalculate();

    await expect(rebalancePage.getOutputLocator("MSFT")).toHaveText("-400.00");
    await expect(rebalancePage.getOutputLocator("ORCL")).toHaveText("90.91");
  });
});
