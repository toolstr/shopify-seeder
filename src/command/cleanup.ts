import chalk from "chalk";
import { getStoreConfig } from "../utils/store-config";
import { createShopifyAPI } from "../utils/api";

export async function cleanupModule(module: string, store: string) {
  const { shop, token } = getStoreConfig(store);
  const api = createShopifyAPI(shop, token);

  console.log(chalk.blue(`🧹 Cleaning up ${module} from store: ${shop}`));

  try {
    let endpoint: string;
    let itemKey: string;
    let itemNameKey: string;

    switch (module.toLowerCase()) {
      case "products":
        endpoint = "/products.json";
        itemKey = "products";
        itemNameKey = "title";
        break;
      case "customers":
        endpoint = "/customers.json";
        itemKey = "customers";
        itemNameKey = "email";
        break;
      case "collections":
        endpoint = "/custom_collections.json";
        itemKey = "custom_collections";
        itemNameKey = "title";
        break;
      case "orders":
        endpoint = "/orders.json";
        itemKey = "orders";
        itemNameKey = "name";
        break;
      default:
        throw new Error(
          `Unknown module: ${module}. Supported modules: products, customers, collections, orders`
        );
    }

    // Fetch all items
    const response = await api.get(endpoint + "?limit=250");
    const items = response.data[itemKey];

    if (items.length === 0) {
      console.log(chalk.yellow(`⚠️  No ${module} found to clean up.`));
      return;
    }

    console.log(chalk.blue(`Found ${items.length} ${module} to delete...`));

    // Delete each item
    for (const item of items) {
      try {
        const deleteEndpoint = `${endpoint.replace(".json", "")}/${
          item.id
        }.json`;
        await api.delete(deleteEndpoint);
        console.log(chalk.green(`✓ Deleted: ${item[itemNameKey]}`));
      } catch (err: any) {
        console.error(
          chalk.red(
            `✗ Error deleting ${item[itemNameKey]}: ${
              err.response?.data?.errors || err.message
            }`
          )
        );
      }
    }

    console.log(chalk.green(`✅ Cleanup completed for ${module}`));
  } catch (err: any) {
    console.error(
      chalk.red(
        `✗ Cleanup failed: ${err.response?.data?.errors || err.message}`
      )
    );
  }
}
