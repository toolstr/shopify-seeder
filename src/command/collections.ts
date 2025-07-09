import { faker } from "@faker-js/faker";
import chalk from "chalk";
import { getStoreConfig } from "../utils/store-config";
import { createShopifyAPI } from "../utils/api";

export async function seedCollections(tag: string, store: string) {
  const { shop, token } = getStoreConfig(store);
  const api = createShopifyAPI(shop, token);

  const smartCollection = {
    smart_collection: {
      title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Collection`,
      body_html: `<p>Products tagged with "${tag}"</p>`,
      published: true,
      rules: [
        {
          column: "tag",
          relation: "equals",
          condition: tag,
        },
      ],
    },
  };

  try {
    const res = await api.post("/smart_collections.json", smartCollection);
    console.log(
      chalk.green(
        `✓ Created smart collection: ${res.data.smart_collection.title} (tag: ${tag})`
      )
    );
  } catch (err: any) {
    console.error(
      chalk.red(
        `✗ Error creating smart collection for tag "${tag}": ${
          err.response?.data?.errors || err.message
        }`
      )
    );
  }
}
