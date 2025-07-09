import { faker } from "@faker-js/faker";
import chalk from "chalk";
import { getStoreConfig } from "../utils/store-config";
import { createShopifyAPI } from "../utils/api";
import { getRandomAddresses } from "../utils/addresses";

export async function seedCustomer(
  email: string,
  firstName: string,
  lastName: string,
  countryCode: string,
  provinceCode: string,
  addressCount: number,
  store: string
) {
  const { shop, token } = getStoreConfig(store);
  const api = createShopifyAPI(shop, token);

  console.log(
    chalk.blue(`🌱 Creating customer: ${firstName} ${lastName} (${email})`)
  );

  // Get predefined addresses for the country-province
  const addresses = getRandomAddresses(
    Number(addressCount),
    countryCode,
    provinceCode
  );

  if (addresses.length === 0) {
    console.log(
      chalk.yellow(
        `⚠️  No predefined addresses found for ${countryCode}${
          provinceCode ? `-${provinceCode}` : ""
        }. Creating customer without addresses.`
      )
    );
  } else {
    console.log(
      chalk.blue(
        `Found ${addresses.length} predefined addresses for ${countryCode}${
          provinceCode ? `-${provinceCode}` : ""
        }`
      )
    );
  }

  // Convert addresses to Shopify format
  const shopifyAddresses = addresses.map((address, index) => ({
    address1: address.address1,
    address2: faker.location.secondaryAddress(),
    city: address.city,
    province: address.province,
    country: address.country,
    zip: address.zip,
    phone: faker.string.numeric(10),
    default: index === 0,
  }));

  const customer = {
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: faker.string.numeric(10),
      verified_email: true,
      addresses: shopifyAddresses,
    },
  };

  try {
    const res = await api.post("/customers.json", customer);
    console.log(
      chalk.green(`✓ Created customer: ${firstName} ${lastName} (${email})`)
    );

    if (shopifyAddresses.length > 0) {
      console.log(
        chalk.blue(
          `  Addresses: ${shopifyAddresses.length} addresses in ${shopifyAddresses[0].country}`
        )
      );

      // Show address details
      shopifyAddresses.forEach((address, index) => {
        console.log(
          chalk.gray(
            `  Address ${index + 1}: ${address.address2}, ${
              address.address1
            }, ${address.city}, ${address.province}, ${address.country} ${
              address.zip
            }`
          )
        );
      });
    }
  } catch (err: any) {
    console.error(
      chalk.red(
        `✗ Error creating customer: ${
          JSON.stringify(err.response?.data?.errors) || err.message
        }`
      )
    );
  }
}
