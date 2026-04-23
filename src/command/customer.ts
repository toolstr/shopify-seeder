import { faker } from "@faker-js/faker";
import chalk from "chalk";
import { getStoreConfig } from "../utils/store-config";
import { createShopifyAPI } from "../utils/api";
import { getRandomAddresses } from "../utils/addresses";
import { withRetry } from "../utils/retry";

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

  // Generate 10-digit phone number (first digit 1-9, rest 0-9)
  const generatePhoneNumber = (): string => {
    const firstDigit = Math.floor(Math.random() * 9) + 1; // 1-9
    const remainingDigits = faker.string.numeric(9); // 9 more digits
    return `${firstDigit}${remainingDigits}`;
  };

  // Convert addresses to Shopify format
  const shopifyAddresses = addresses.map((address, index) => ({
    address1: address.address1,
    address2: faker.location.secondaryAddress(),
    city: address.city,
    province: address.province,
    country: address.country,
    zip: address.zip,
    phone: generatePhoneNumber(),
    default: index === 0,
  }));

  const customer = {
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: generatePhoneNumber(),
      verified_email: true,
      addresses: shopifyAddresses,
    },
  };

  try {
    const res = await withRetry(
      () => api.post("/customers.json", customer),
      5,
      "Create customer"
    );
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

    return res.data.customer.id;
  } catch (err: any) {
    console.error(
      chalk.red(
        `✗ Error creating customer: ${
          JSON.stringify(err.response?.data?.errors) || err.message
        }`
      )
    );
    return null;
  }
}
