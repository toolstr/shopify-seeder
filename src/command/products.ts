import { faker } from "@faker-js/faker";
import chalk from "chalk";
import { getStoreConfig } from "../utils/store-config";
import { createShopifyAPI } from "../utils/api";

export async function seedProducts(
  count: number,
  store: string,
  tags?: string,
  variantsCount: number = 1
) {
  const { shop, token } = getStoreConfig(store);
  const api = createShopifyAPI(shop, token);

  for (let i = 0; i < count; i++) {
    // Generate variants
    const variants: any[] = [];
    for (let j = 0; j < variantsCount; j++) {
      const variant: any = {
        option1:
          variantsCount === 1
            ? "Default Title"
            : faker.commerce.productAdjective(),
        price: faker.commerce.price({ min: 10, max: 1000 }),
        sku: faker.string.uuid(),
        inventory_quantity: faker.number.int({ min: 0, max: 100 }),
      };
      variants.push(variant);
    }

    const product = {
      product: {
        title: faker.commerce.productName(),
        body_html: `<strong>${faker.commerce.productDescription()}</strong>`,
        vendor: faker.company.name(),
        product_type: faker.commerce.department(),
        tags: tags || "",
        variants: variants,
      },
    };

    try {
      const res = await api.post("/products.json", product);
      console.log(
        chalk.green(
          `✓ Created: ${res.data.product.title} with ${variantsCount} variant(s)`
        )
      );
    } catch (err: any) {
      console.error(
        chalk.red(
          `✗ Error: ${JSON.stringify(err.response.data) || err.message}`
        )
      );
    }

    // Add delay to prevent throttling (except for the last product)
    if (i < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
