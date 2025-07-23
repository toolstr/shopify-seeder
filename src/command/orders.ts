import chalk from "chalk";
import { getStoreConfig } from "../utils/store-config";
import { createShopifyAPI } from "../utils/api";

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

export async function seedOrders(
  count: number,
  store: string,
  customerId: string,
  productsPerOrder: number = 1,
  addDateTime: boolean = false
) {
  const dateTimeInfo = addDateTime ? " with date/time attributes" : "";
  console.log(
    chalk.blue(
      `🛒 Creating ${count} orders for customer ID: ${customerId}${dateTimeInfo}`
    )
  );
  const { shop, token } = getStoreConfig(store);
  const api = createShopifyAPI(shop, token);

  try {
    // Fetch specific customer
    const customerRes = await api.get(`/customers/${customerId}.json`);
    // Add delay to prevent throttling
    await new Promise((resolve) => setTimeout(resolve, 500));
    const customer = customerRes.data.customer;

    if (!customer) {
      console.log(chalk.red(`✗ Customer with ID ${customerId} not found.`));
      return;
    }

    console.log(
      chalk.blue(
        `Customer: ${customer.first_name} ${customer.last_name} (${customer.email})`
      )
    );
    console.log(
      chalk.blue(
        `Addresses: ${customer.addresses?.length || 0} addresses available`
      )
    );

    // Fetch products
    const productsRes = await api.get("/products.json?limit=250");
    // Add delay to prevent throttling
    await new Promise((resolve) => setTimeout(resolve, 500));

    const products = productsRes.data.products;

    if (products.length === 0) {
      console.log(chalk.yellow("⚠️  Cannot create orders without products."));
      return;
    }

    for (let i = 0; i < count; i++) {
      // Generate line items for this order
      const lineItems = [];
      for (let j = 0; j < productsPerOrder; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant =
          product.variants[Math.floor(Math.random() * product.variants.length)];

        lineItems.push({
          variant_id: variant.id,
          quantity: Math.floor(Math.random() * 3) + 1,
        });
      }

      // Select random address from customer's addresses
      let shippingAddress = null;
      if (customer.addresses && customer.addresses.length > 0) {
        const randomAddressIndex = Math.floor(
          Math.random() * customer.addresses.length
        );
        shippingAddress = customer.addresses[randomAddressIndex];
      }

      const order = {
        order: {
          customer: { id: customer.id },
          line_items: lineItems,
          financial_status: "paid",
          tags: "seeded-order",
          ...(shippingAddress && {
            shipping_address: shippingAddress,
          }),
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
        const res = await api.post("/orders.json", order);
        const addressInfo = shippingAddress
          ? ` (shipped to ${shippingAddress.city})`
          : "";
        const dateTimeInfo = addDateTime ? " (with date/time attributes)" : "";
        console.log(
          chalk.green(
            `✓ Created: ${res.data.order.name} with ${productsPerOrder} product(s)${addressInfo}${dateTimeInfo}`
          )
        );
      } catch (err: any) {
        console.error(
          chalk.red(`✗ Error: ${err.response?.data?.errors || err.message}`)
        );
      }

      // Add delay to prevent throttling (except for the last order)
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  } catch (err: any) {
    console.error(
      chalk.red(
        `✗ Error fetching customer: ${
          err.response?.data?.errors || err.message
        }`
      )
    );
  }
}
