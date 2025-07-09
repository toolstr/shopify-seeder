#!/usr/bin/env ts-node

import { Command } from "commander";
import dotenv from "dotenv";
dotenv.config();

import { seedProducts } from "../src/command/products";
import { seedCustomer } from "../src/command/customer";
import { seedCollections } from "../src/command/collections";
import { seedOrders } from "../src/command/orders";
import { cleanupModule } from "../src/command/cleanup";

const program = new Command();

program
  .name("shopify-seeder")
  .description("🛒 Seed test data into Shopify stores for development & QA")
  .version("1.0.0");

program
  .command("help")
  .description("Show help for a command")
  .action(() => program.help());

program
  .command("version")
  .description("Show version number")
  .action(() => console.log(`shopify-seeder v${program.version()}`));

program
  .command("products")
  .option("--count <number>", "How many products to create", "10")
  .option(
    "--store <store>",
    "Store key from .env",
    process.env.DEFAULT_STORE || ""
  )
  .option("--tag <tags>", "Comma-separated tags to add to products")
  .option(
    "--variants <number>",
    "Number of variants to create per product",
    "1"
  )
  .action((opts) =>
    seedProducts(
      Number(opts.count),
      opts.store,
      opts.tag,
      Number(opts.variants)
    )
  );

program
  .command("customer")
  .argument("<email>", "Customer email address")
  .argument("<firstName>", "Customer first name")
  .argument("<lastName>", "Customer last name")
  .option("--country <code>", "Country code (e.g., IN, US)")
  .option("--province <code>", "Province/state code (e.g., MH, CA)")
  .option(
    "--address-count <number>",
    "Number of addresses to create (max 20)",
    "1"
  )
  .option(
    "--store <store>",
    "Store key from .env",
    process.env.DEFAULT_STORE || ""
  )
  .action((email, firstName, lastName, opts) =>
    seedCustomer(
      email,
      firstName,
      lastName,
      opts.country,
      opts.province,
      opts.addressCount,
      opts.store
    )
  );

program
  .command("collections")
  .argument("<tag>", "Tag to create smart collection for")
  .option(
    "--store <store>",
    "Store key from .env",
    process.env.DEFAULT_STORE || ""
  )
  .action((tag, opts) => seedCollections(tag, opts.store));

program
  .command("orders")
  .argument("<customerId>", "Customer ID to create orders for")
  .option("--count <number>", "How many orders to create", "10")
  .option("--products <number>", "How many products per order", "1")
  .option(
    "--store <store>",
    "Store key from .env",
    process.env.DEFAULT_STORE || ""
  )
  .action((customerId, opts) =>
    seedOrders(
      Number(opts.count),
      opts.store,
      customerId,
      Number(opts.products)
    )
  );

program
  .command("cleanup")
  .argument(
    "<module>",
    "Module to clean up (products, customers, collections, orders)"
  )
  .option(
    "--store <store>",
    "Store key from .env",
    process.env.DEFAULT_STORE || ""
  )
  .action((module, opts) => {
    cleanupModule(module, opts.store);
  });

program.parse();
