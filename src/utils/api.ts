import axios from "axios";

export function createShopifyAPI(shop: string, token: string) {
  return axios.create({
    baseURL: `https://${shop}/admin/api/2025-07`,
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
}
