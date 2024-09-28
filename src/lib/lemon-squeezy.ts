/**
 * imports: externals
 */

import Logger from "@sha3/logger";

/**
 * module: initializations
 */

const logger = new Logger("lemon–squeezy");

/**
 * consts
 */

const LEMON_SQUEEZY_API_BASE_URL = "https://api.lemonsqueezy.com";

/**
 * types
 */

export type LemonSqueezyOptions = { storeId: number; apiKey: string };

export type CustomerAttributes = {
  store_id: number;
  name: string;
  email: string;
  status: string;
  city: string | null;
  region: string | null;
  country: string;
  total_revenue_currency: number;
  mrr: number;
  status_formatted: string;
  country_formatted: string;
  total_revenue_currency_formatted: string;
  mrr_formatted: string;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
  urls: {
    customer_portal: string;
  };
};

export type SubscriptionAttributes = {
  store_id: number;
  customer_id: number;
  order_id: number;
  order_item_id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  user_name: string;
  user_email: string;
  status: string;
  status_formatted: string;
  card_brand: string;
  card_last_four: string;
  pause: any | null;
  cancelled: boolean;
  trial_ends_at: string | null;
  billing_anchor: number;
  renews_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
  first_subscription_item: {
    id: number;
    subscription_id: number;
    price_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
  };
  urls: {
    update_payment_method: string;
    customer_portal: string;
    customer_portal_update_subscription: string;
  };
};

export type CustomerWithSubscriptionsResponse = {
  data: { type: "customers"; id: string; attributes: CustomerAttributes };
  included: {
    type: "subscriptions";
    id: string;
    attributes: SubscriptionAttributes;
  }[];
};

export type SendRequestResponse =
  | {
      error: true;
      status: number;
      message: string;
    }
  | {
      error: false;
      status: number;
      body: CustomerWithSubscriptionsResponse;
    };

export type GetCustomerResponse = {
  id: number;
  is_active: boolean;
  subscriptions: SubscriptionAttributes[];
} & CustomerAttributes;

/**
 * export
 */

export default class LemonSqueezy {
  /**
   * constructor
   */

  constructor(private options: LemonSqueezyOptions) {}

  /**
   * private : methods
   */

  private getHeaders() {
    const { apiKey } = this.options;
    return {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  private async sendRequest(partialUrl: string): Promise<SendRequestResponse> {
    const lemonSqueezyUrl = `${LEMON_SQUEEZY_API_BASE_URL}${partialUrl}`;
    logger.debug(`lemon squeezy request: ${lemonSqueezyUrl}`);
    try {
      const response = await fetch(lemonSqueezyUrl, {
        headers: this.getHeaders(),
      });
      if (response.ok) {
        const body =
          (await response.json()) as CustomerWithSubscriptionsResponse;
        return { error: false, status: response.status, body };
      } else {
        const error = (await response.json())?.errors?.[0] as string;
        return { error: true, status: response.status, message: error };
      }
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (e as any)?.cause?.message || (e as any).message;
      return { error: true, status: 500, message };
    }
  }

  /**
   * public : methods
   */

  public async getCustomer(
    emailOrId: string
  ): Promise<GetCustomerResponse | null> {
    const { storeId } = this.options;
    const isId = !isNaN(Number(emailOrId));
    const encodedParam = encodeURIComponent(emailOrId);
    const partialUrl = isId
      ? `/v1/customers/${encodedParam}?include=subscriptions`
      : `/v1/customers?filter[store_id]=${storeId}&filter[email]=${encodedParam}&include=subscriptions`;
    const result = await this.sendRequest(partialUrl);
    const { error, status } = result;
    if (error) {
      if (status !== 404) {
        return null;
      }
      throw new Error(`error retrieving customer: ${result.message}`);
    } else if (error === false) {
      const { body } = result;
      const customerData = Array.isArray(body.data) ? body.data[0] : body.data;
      const customerAttributes = customerData.attributes as CustomerAttributes;
      const subscriptions = body.included.map((i) => ({
        id: i.id,
        ...i.attributes,
      }));
      return {
        id: customerData.id,
        is_active: !!subscriptions.find((i) => i.status === "active"),
        ...customerAttributes,
        subscriptions,
      };
    }
  }
}
