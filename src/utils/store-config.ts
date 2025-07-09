import dotenv from "dotenv";
dotenv.config();

export function getStoreConfig(storeKey: string): {
  shop: string;
  token: string;
} {
  const key = storeKey.toUpperCase().replace(/-/g, "_");
  console.log("[store-config] key", key);
  const shop = process.env[`SHOPIFY_${key}_SHOP`];
  const token = process.env[`SHOPIFY_${key}_TOKEN`];

  if (!shop || !token) {
    throw new Error(`Missing credentials for store: ${storeKey}`);
  }

  return { shop, token };
}
