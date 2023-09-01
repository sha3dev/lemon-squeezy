/**
 * imports: externals
 */

import Logger from "@sha3dev/logger";

/**
 * module: initializations
 */

const logger = new Logger("lemon–squeezy");

/**
 * consts
 */

const LEMON_SQUEEZY_API_BASE_URL = "https://api.lemonsqueezy.com";

/**
 * export
 */

export default class LemonSqueezy {
  /**
   * constructor
   */

  constructor(private options: { storeId: number; apiKey: string }) {}

  /**
   * private : methods
   */

  private getHeaders() {
    const { apiKey } = this.options;
    return {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`
    };
  }

  private async sendRequest(partialUrl: string) {
    const lemonSqueezyUrl = `${LEMON_SQUEEZY_API_BASE_URL}${partialUrl}`;
    logger.debug(`lemon squeezy request: ${lemonSqueezyUrl}`);
    const response = await fetch(lemonSqueezyUrl, { headers: this.getHeaders() });
    if (response.ok) {
      const json = await response.json();
      return json;
    }
    throw new Error(`invalid lemon squeezy response: ${response.status}`);
  }

  /**
   * public : methods
   */

  public async getCustomer(email: string) {
    const json = await this.sendRequest(
      `https://api.lemonsqueezy.com/v1/customers?filter[store_id]=42298&filter[email]=${encodeURIComponent(email)}`
    );
    return json;
  }
}
