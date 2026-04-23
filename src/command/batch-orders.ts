import chalk from "chalk";
import { getStoreConfig } from "../utils/store-config";
import { createShopifyAPI } from "../utils/api";
import { withRetry } from "../utils/retry";

// Helper function to generate random date between tomorrow and next 10 days
function generateRandomDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 10);

  const randomTime =
    tomorrow.getTime() +
    Math.random() * (maxDate.getTime() - tomorrow.getTime());
  const randomDate = new Date(randomTime);

  return randomDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
}

// Helper function to generate random time slot
function generateRandomTimeSlot(): string {
  const timeSlots = [
    "09:00am - 11:00am",
    "11:00am - 01:00pm",
    "01:00pm - 03:00pm",
    "03:00pm - 05:00pm",
    "05:00pm - 07:00pm",
  ];

  return timeSlots[Math.floor(Math.random() * timeSlots.length)];
}

// Helper function to shuffle array randomly (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function seedBatchOrders(
  count: number,
  store: string,
  minProductsPerOrder: number = 1,
  maxProductsPerOrder: number = 1,
  minQuantityPerProduct: number = 1,
  maxQuantityPerProduct: number = 3,
  addDateTime: boolean = false
) {
  if (minProductsPerOrder > maxProductsPerOrder) {
    [minProductsPerOrder, maxProductsPerOrder] = [
      maxProductsPerOrder,
      minProductsPerOrder,
    ];
  }
  if (minQuantityPerProduct > maxQuantityPerProduct) {
    [minQuantityPerProduct, maxQuantityPerProduct] = [
      maxQuantityPerProduct,
      minQuantityPerProduct,
    ];
  }

  const dateTimeInfo = addDateTime ? " with date/time attributes" : "";
  console.log(
    chalk.blue(
      `🛒 Creating ${count} orders for ${count} different customers${dateTimeInfo}`
    )
  );
  const { shop, token } = getStoreConfig(store);
  const api = createShopifyAPI(shop, token);

  try {
    // Phase 1: Load a pool of customers with addresses, then randomly select x
    const poolSize = Math.max(250, count * 2); // Fetch at least 250 or 2x the requested count
    console.log(
      chalk.blue(
        `\n📋 Phase 1: Loading pool of customers with addresses (target: ${poolSize}), then randomly selecting ${count}...`
      )
    );

    let allCustomers: any[] = [];
    let customersWithAddresses: any[] = [];
    let pageInfo: string | null = null;
    let hasNextPage = true;
    let totalFetched = 0;

    // Fetch customers with pagination until we have a good pool with addresses
    while (hasNextPage && customersWithAddresses.length < poolSize) {
      const url: string = pageInfo
        ? `/customers.json?limit=250&page_info=${pageInfo}`
        : "/customers.json?limit=250";

      const customersRes: any = await withRetry(
        () => api.get(url),
        5,
        "Fetch customers"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      const customers = customersRes.data.customers || [];
      allCustomers = [...allCustomers, ...customers];
      totalFetched += customers.length;

      // Filter customers to only include those with addresses (skip those without)
      const customersWithAddrs = customers.filter(
        (customer: any) => customer.addresses && customer.addresses.length > 0
      );
      const skippedCount = customers.length - customersWithAddrs.length;
      customersWithAddresses = [
        ...customersWithAddresses,
        ...customersWithAddrs,
      ];

      if (skippedCount > 0) {
        console.log(
          chalk.gray(
            `  Fetched ${customers.length} customer(s) from this page, skipped ${skippedCount} without addresses`
          )
        );
      }
      console.log(
        chalk.gray(
          `  Total: ${totalFetched} fetched, ${customersWithAddresses.length} with addresses (target: ${poolSize})...`
        )
      );

      // Check for pagination
      const linkHeader: string | undefined = customersRes.headers?.link;
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch: RegExpMatchArray | null = linkHeader.match(
          /page_info=([^>]+)>; rel="next"/
        );
        pageInfo = nextMatch ? nextMatch[1] : null;
        hasNextPage = !!pageInfo;
      } else {
        hasNextPage = false;
      }
    }

    if (customersWithAddresses.length === 0) {
      console.log(
        chalk.red(
          "✗ No customers with addresses found in store. Cannot create orders."
        )
      );
      return;
    }

    console.log(
      chalk.green(
        `✓ Loaded pool of ${customersWithAddresses.length} customer(s) with addresses`
      )
    );

    // Randomly shuffle and select 'count' customers from the pool
    const shuffledCustomers = shuffleArray(customersWithAddresses);
    const selectedCustomers = shuffledCustomers.slice(
      0,
      Math.min(count, shuffledCustomers.length)
    );

    if (selectedCustomers.length < count) {
      console.log(
        chalk.yellow(
          `⚠️  Only ${selectedCustomers.length} customer(s) with addresses found in pool, but ${count} requested. Will create orders for ${selectedCustomers.length} customer(s).`
        )
      );
    } else {
      console.log(
        chalk.blue(
          `✓ Randomly selected ${selectedCustomers.length} customer(s) from pool of ${customersWithAddresses.length}`
        )
      );
    }

    console.log(
      chalk.green(
        `✓ Phase 1 Complete: Loaded ${selectedCustomers.length} customer(s) with addresses`
      )
    );

    // Display loaded customers with address info
    console.log(chalk.blue("\n  Loaded customers (with addresses):"));
    selectedCustomers.forEach((customer, index) => {
      const addressCount = customer.addresses?.length || 0;
      console.log(
        chalk.gray(
          `    ${index + 1}. ${customer.first_name} ${customer.last_name} (${
            customer.email
          }) - ${addressCount} address(es)`
        )
      );
    });

    // Phase 2: Load products and create orders
    console.log(
      chalk.blue(`\n📦 Phase 2: Loading products and creating orders...`)
    );

    // Fetch products
    const productsRes: any = await withRetry(
      () => api.get("/products.json?limit=250"),
      5,
      "Fetch products"
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    const products = productsRes.data.products;

    if (products.length === 0) {
      console.log(chalk.red("✗ Cannot create orders without products."));
      return;
    }

    console.log(
      chalk.green(`✓ Loaded ${products.length} product(s) available for orders`)
    );

    // Create one order for each customer
    for (let i = 0; i < selectedCustomers.length; i++) {
      const customer = selectedCustomers[i];

      console.log(
        chalk.blue(
          `\n[${i + 1}/${
            selectedCustomers.length
          }] Creating order for customer: ${customer.first_name} ${
            customer.last_name
          } (${customer.email})`
        )
      );

      const productsInThisOrder =
        Math.floor(Math.random() * (maxProductsPerOrder - minProductsPerOrder + 1)) +
        minProductsPerOrder;

      // Generate line items for this order
      const lineItems = [];
      for (let j = 0; j < productsInThisOrder; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant =
          product.variants[Math.floor(Math.random() * product.variants.length)];

        lineItems.push({
          variant_id: variant.id,
          quantity:
            Math.floor(
              Math.random() * (maxQuantityPerProduct - minQuantityPerProduct + 1)
            ) + minQuantityPerProduct,
        });
      }

      // Select random address from customer's addresses (guaranteed to exist)
      const randomAddressIndex = Math.floor(
        Math.random() * customer.addresses.length
      );
      const shippingAddress = customer.addresses[randomAddressIndex];

      const order = {
        order: {
          customer: { id: customer.id },
          line_items: lineItems,
          financial_status: "paid",
          tags: "seeded-order",
          shipping_address: shippingAddress,
          ...(addDateTime && {
            note_attributes: [
              {
                name: "Date",
                value: generateRandomDate(),
              },
              {
                name: "Time",
                value: generateRandomTimeSlot(),
              },
            ],
          }),
        },
      };

      try {
        const res: any = await withRetry(
          () => api.post("/orders.json", order),
          5,
          "Create order"
        );
        const addressInfo = ` (shipped to ${shippingAddress.city}, ${shippingAddress.province})`;
        const dateTimeInfo = addDateTime ? " (with date/time attributes)" : "";
        console.log(
          chalk.green(
            `✓ Created: ${res.data.order.name} with ${productsInThisOrder} product(s)${addressInfo}${dateTimeInfo}`
          )
        );
      } catch (err: any) {
        console.error(
          chalk.red(
            `✗ Error creating order for customer ${customer.email}: ${
              err.response?.data?.errors || err.message
            }`
          )
        );
      }

      // Add delay to prevent throttling (except for the last order)
      if (i < selectedCustomers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      chalk.green(
        `\n✓ Phase 2 Complete: Successfully created ${selectedCustomers.length} order(s) for ${selectedCustomers.length} different customer(s)`
      )
    );
  } catch (err: any) {
    console.error(
      chalk.red(`✗ Error: ${err.response?.data?.errors || err.message}`)
    );
  }
}
