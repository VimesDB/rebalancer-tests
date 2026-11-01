import { Locator, Page } from "@playwright/test";

export class RebalancePage {
  private readonly page: Page;
  private readonly totalAssetInput: Locator;
  private readonly calculateButton: Locator;
  private readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalAssetInput = page.getByTestId("total-asset-input");
    this.calculateButton = page.getByTestId("calculate-button");
    this.validationError = page.getByTestId("validation-error");
  }

  async navigate() {
    await this.page.goto("/");
  }

  async clickCalculate() {
    await this.calculateButton.click();
  }

  async fillTotalAsset(value: string) {
    await this.totalAssetInput.fill(value);
  }

  async fillTargetPercentage(security: string, value: string) {
    await this.page.getByTestId(`input-target-${security}`).fill(value);
  }

  async fillCurrentPercentage(security: string, value: string) {
    await this.page.getByTestId(`input-current-${security}`).fill(value);
  }

  async fillUnitPrice(security: string, value: string) {
    await this.page.getByTestId(`input-price-${security}`).fill(value);
  }

  getVarianceLocator(security: string): Locator {
    return this.page.getByTestId(`variance-${security}`);
  }

  getOutputLocator(security: string): Locator {
    return this.page.getByTestId(`output-${security}`);
  }

  getValidationErrorLocator(): Locator {
    return this.validationError;
  }

  getCalculateButtonLocator(): Locator {
    return this.calculateButton;
  }

  getTargetInputLocator(security: string): Locator {
    return this.page.getByTestId(`input-target-${security}`);
  }

  getCurrentInputLocator(security: string): Locator {
    return this.page.getByTestId(`input-current-${security}`);
  }

  getPriceInputLocator(security: string): Locator {
    return this.page.getByTestId(`input-price-${security}`);
  }

  getTotalAssetInputLocator(): Locator {
    return this.totalAssetInput;
  }
}
