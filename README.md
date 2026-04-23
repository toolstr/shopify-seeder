# Shopify Seeder 🛒

A powerful CLI tool for seeding test data into Shopify stores for development and QA testing. Generate realistic products, customers, collections, and orders with ease.

## Features

- 🌱 **Product Seeding**: Create products with multiple variants
- 👥 **Customer Seeding**: Create customers with realistic addresses
- 📚 **Collection Seeding**: Create smart collections based on tags
- 🛒 **Order Seeding**: Create orders with random variants
- 📦 **Batch Order Seeding**: Create orders for multiple different customers
- 🧹 **Cleanup**: Remove seeded data from your store
- ⚡ **Rate Limiting**: Built-in delays to prevent API throttling
- 🏪 **Multi-Store Support**: Work with multiple Shopify stores

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd shopify-seeder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

## Configuration

Create a `.env` file with your Shopify store configurations:

```env
# Default store (optional)
DEFAULT_STORE=awesome-store

# Store configurations
SHOPIFY_AWESOME_STORE_SHOP=awesome-store.myshopify.com
SHOPIFY_AWESOME_STORE_TOKEN=shpat_xxxxxxxxxxx

# Add more stores as needed
SHOPIFY_ANOTHER_STORE_SHOP=another-store.myshopify.com
SHOPIFY_ANOTHER_STORE_TOKEN=shpat_xxxxxxxxxxx
```

### Getting Shopify Access Token

1. Go to your Shopify admin
2. Navigate to Apps > Develop apps
3. Create a private app
4. Configure the required permissions:
   - **Products**: Read/Write
   - **Customers**: Read/Write
   - **Orders**: Read/Write
   - **Collections**: Read/Write
5. Copy the access token

### Required Shopify API Access Scopes

To use this tool, your Shopify access token must have the following API access scopes:

- `write_products`
- `write_customers`
- `write_orders`

**How to set up:**

1. Create a custom app in your Shopify store admin (Apps > Develop apps > Create an app).
2. Assign the above access scopes to the app.
3. Install the app on your store and copy the generated access token.
4. Use this token in your `.env` file as shown above.

> ⚠️ **Note:** Without these write permissions, the seeder will not be able to create or delete products, customers, orders, or collections.

## Usage

### Basic Commands

```bash
# Show help
npm run seed -- help

# Show version
npm run seed -- version
```

### Product Seeding

Create products with customizable variants:

```bash
# Create 10 products (default)
npm run seed -- products

# Create 5 products with 3 variants each
npm run seed -- products --count=5 --variants=3

# Create products with specific tags
npm run seed -- products --count=3 --tag="electronics,wireless"

# Create products for specific store
npm run seed -- products --count=2 --variants=2 --store=my-store
```

**Options:**

- `--count <number>`: Number of products to create (default: 10)
- `--variants <number>`: Number of variants per product (default: 1)
- `--tag <tags>`: Comma-separated tags to add to products
- `--store <store>`: Store key from .env

### Customer Seeding

Create customers with realistic addresses:

```bash
# Create a customer with default settings
npm run seed -- customer john@example.com "John" "Doe"

# Create customer with specific country/province
npm run seed -- customer jane@example.com "Jane" "Smith" --country=IN --province=MH

# Create customer with multiple addresses
npm run seed -- customer bob@example.com "Bob" "Wilson" --country=US --province=CA --address-count=3

# Create customer for specific store
npm run seed -- customer alice@example.com "Alice" "Brown" --store=my-store
```

**Arguments:**

- `<email>`: Customer email address
- `<firstName>`: Customer first name
- `<lastName>`: Customer last name

**Options:**

- `--country <code>`: Country code (e.g., IN, US)
- `--province <code>`: Province/state code (e.g., MH, CA)
- `--address-count <number>`: Number of addresses (max 20, default: 1)
- `--store <store>`: Store key from .env

### Collection Seeding

Create smart collections based on product tags:

```bash
# Create collection for "electronics" tag
npm run seed -- collections electronics

# Create collection for specific store
npm run seed -- collections "wireless" --store=my-store
```

**Arguments:**

- `<tag>`: Tag to create smart collection for

**Options:**

- `--store <store>`: Store key from .env

### Order Seeding

Create orders for existing customers:

```bash
# Create 10 orders for customer (default)
npm run seed -- orders 123456

# Create 5 orders for customer
npm run seed -- orders 123456 --count=5

# Create orders with 3 products each
npm run seed -- orders 123456 --products=3

# Create 5 orders with 2 products each
npm run seed -- orders 123456 --count=5 --products=2

# Create orders with date/time attributes
npm run seed -- orders 123456 --date-time

# Create orders for specific store
npm run seed -- orders 123456 --count=3 --store=my-store
```

**Arguments:**

- `<customerId>`: Customer ID to create orders for

**Options:**

- `--count <number>`: Number of orders to create (default: 10)
- `--products <number>`: Number of products per order (default: 1)
- `--date-time`: Add Date and Time order attributes (note attributes)
- `--store <store>`: Store key from .env

### Batch Order Seeding

Create orders for different customers (one order per customer). This command works in two phases:

1. **Phase 1**: Loads x existing customers **with addresses** from your store
2. **Phase 2**: Creates one order for each loaded customer (all orders include shipping addresses)

```bash
# Create 10 orders for 10 different customers (default)
npm run seed -- batch-orders

# Create 5 orders for 5 different customers
npm run seed -- batch-orders --count=5

# Create orders with 3 products each
npm run seed -- batch-orders --products=3

# Create 5 orders with 2 products each for 5 different customers
npm run seed -- batch-orders --count=5 --products=2

# Create orders with date/time attributes
npm run seed -- batch-orders --date-time

# Create orders for specific store
npm run seed -- batch-orders --count=3 --store=my-store
```

**Options:**

- `--count <number>`: Number of orders/customers to create orders for (default: 10)
- `--products <number>`: Number of products per order (default: 1)
- `--date-time`: Add Date and Time order attributes (note attributes)
- `--store <store>`: Store key from .env

**How it works:**

- The command first loads a pool of customers **with addresses** from your store (target: 250 or 2x the requested count, whichever is larger)
- Only customers that have at least one address are included
- It then **randomly selects** the specified number of customers from this pool (ensuring different customers each run)
- It displays all selected customers (with their address count) before proceeding
- Then it creates one order for each selected customer
- **All orders are guaranteed to have a shipping address** (randomly selected from the customer's addresses)
- If there are fewer customers with addresses in the pool than requested, it will create orders for all available customers with addresses and display a warning

### Cleanup

Remove seeded data from your store:

```bash
# Clean up all products
npm run seed -- cleanup products

# Clean up all customers
npm run seed -- cleanup customers

# Clean up all collections
npm run seed -- cleanup collections

# Clean up all orders
npm run seed -- cleanup orders

# Clean up for specific store
npm run seed -- cleanup products --store=my-store
```

**Arguments:**

- `<module>`: Module to clean up (products, customers, collections, orders)

**Options:**

- `--store <store>`: Store key from .env

## Command Patterns

All commands follow consistent patterns:

### Options Format

- `--count <number>`: Numeric values
- `--store <store>`: Store configuration key
- `--tag <tags>`: Comma-separated strings
- `--country <code>`: Two-letter country codes
- `--province <code>`: Two-letter province/state codes

### Error Handling

- Graceful error handling with detailed messages
- Rate limiting protection (500ms delays)
- Validation of required parameters

### Output Format

- ✅ Success: Green checkmarks with details
- ⚠️ Warnings: Yellow warnings for missing data
- ❌ Errors: Red error messages with details

## Data Generation

### Products

- **Title**: Realistic product names
- **Description**: Rich HTML descriptions
- **Vendor**: Company names
- **Product Type**: Department/category
- **Variants**: Multiple variants with prices, SKUs, inventory
- **Tags**: Custom tags for organization

### Customers

- **Personal Info**: Realistic names and emails
- **Addresses**: Predefined real addresses by country/province
- **Phone Numbers**: 10-digit numeric strings (Shopify handles country codes)
- **Multiple Addresses**: Up to 20 addresses per customer

**Address Limitations:**

- Currently supports **India (IN)** and **United States (US)** only
- Available provinces: **Maharashtra (MH)**, **California (CA)**
- If no addresses exist for the specified country/province, customer is created without addresses
- Address data is predefined and realistic (not randomly generated)

### Collections

- **Smart Collections**: Based on product tags
- **Automatic Rules**: Tag-based filtering
- **Published**: Ready for use immediately

### Orders

- **Random Products**: Random product selection
- **Random Variants**: Random variant selection
- **Random Quantities**: 1-3 items per order
- **Shipping Addresses**: Customer's addresses
- **Financial Status**: Set to "paid"
- **Date/Time Attributes**: Optional note attributes with:
  - **Date**: Random date between tomorrow and next 10 days (YYYY-MM-DD format)
  - **Time**: Random time slot from: 09:00am-11:00am, 11:00am-01:00pm, 01:00pm-03:00pm, 03:00pm-05:00pm, 05:00pm-07:00pm

## Rate Limiting

The tool includes built-in rate limiting to prevent Shopify API throttling:

- **500ms delays** between API calls
- **Automatic retry logic** for failed requests
- **Graceful error handling** for rate limit errors

## Development

### Project Structure

```
shopify-seeder/
├── bin/
│   └── shopify-seeder.ts    # CLI entry point
├── src/
│   ├── command/             # Command implementations
│   │   ├── products.ts
│   │   ├── customer.ts
│   │   ├── collections.ts
│   │   ├── orders.ts
│   │   ├── batch-orders.ts
│   │   └── cleanup.ts
│   └── utils/               # Utility functions
│       ├── api.ts           # Shopify API client
│       ├── store-config.ts  # Store configuration
│       └── addresses.ts     # Address data
├── package.json
└── README.md
```

### Adding New Commands

1. Create command file in `src/command/`
2. Add CLI definition in `bin/shopify-seeder.ts`
3. Follow consistent patterns for options and error handling

### Testing

```bash
# Test TypeScript compilation
npm run build

# Run with specific store
npm run seed -- products --count=1 --store=test-store
```

## Troubleshooting

### Common Issues

1. **Rate Limiting**: Increase delays or reduce batch sizes
2. **Invalid Store Config**: Check .env file and store credentials
3. **Missing Permissions**: Ensure app has required Shopify permissions
4. **Invalid Customer ID**: Verify customer exists before creating orders

### Error Messages

- `Store configuration not found`: Check .env file
- `Customer with ID not found`: Verify customer ID
- `Cannot create orders without products`: Seed products first
- `Exceeded order API rate limit`: Wait and retry

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the [MIT License](./LICENSE).
