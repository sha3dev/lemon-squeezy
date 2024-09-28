/**
 * imports: externals
 */

import dotenv from "dotenv";
import * as assert from "node:assert";
import { test } from "node:test";
import LemonSqueezy from "../src/index";

/**
 * init
 */

dotenv.config({ path: [".env"] });

/**
 * tests
 */

test("Test", async () => {
  const ls = new LemonSqueezy({
    storeId: Number(process.env.LEMON_SQUEEZY_STORE_ID),
    apiKey: String(process.env.LEMON_SQUEEZY_API_KEY),
  });
  try {
    const result1 = await ls.getCustomer("jc@sha3.dev");
    const resul2 = await ls.getCustomer("1397750");
    console.dir(result1);
    console.dir(resul2);
    assert.ok(result1.id === resul2.id);
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
});
