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
    try {
      const response = await fetch(lemonSqueezyUrl, { headers: this.getHeaders() });
      if (response.ok) {
        const body = await response.json();
        return { body, status: response.status };
      }
      return { error: true, status: response.status };
    } catch (e: any) {
      return { error: true, status: 500, message: e?.cause?.message || e.message };
    }
  }

  /**
   * public : methods
   */

  public async getCustomerByEmail(email: string) {
    const { storeId } = this.options;
    const encodedEmail = encodeURIComponent(email);
    const partialUrl = `/v1/customers?filter[store_id]=${storeId}=&filter[email]=${encodedEmail}`;
    const result = await this.sendRequest(partialUrl);
    if (result.status === 404) {
      return null;
    }
    if (result.status !== 200) {
      const error = result.body?.errors?.[0];
      throw new Error(error || `error retrieving customer`);
    }
    const data = result?.body?.data?.[0];
    if (data) {
      return {
        id: result?.body?.data?.[0]?.id,
        ...result?.body?.data?.[0]?.attributes
      };
    }
    throw new Error(`invalid customer response`);
  }

  public async getCustomerById(id: string) {
    const partialUrl = `/v1/customers/${id}`;
    const result = await this.sendRequest(partialUrl);
    if (result.status === 404) {
      return null;
    }
    if (result.status !== 200) {
      const error = result.body?.errors?.[0];
      throw new Error(error || `error retrieving customer`);
    }
    const data = result?.body?.data?.[0];
    if (data) {
      return {
        id: result?.body?.data?.id,
        ...result?.body?.data?.attributes
      };
    }
    throw new Error(`invalid customer response`);
  }
}
