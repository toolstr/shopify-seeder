import axios, { AxiosError } from "axios";
import chalk from "chalk";

/**
 * Gets the retry delay from HTTP 429 response headers
 * Checks for 'retry-after' header (in seconds) or 'x-shopify-retry-after' header
 */
function getRetryAfterDelay(error: AxiosError): number {
  const headers = error.response?.headers || {};

  // Helper to get header case-insensitively
  const getHeader = (name: string): string | undefined => {
    const lowerName = name.toLowerCase();
    const headerKey = Object.keys(headers).find(
      (key) => key.toLowerCase() === lowerName
    );
    if (!headerKey) return undefined;
    const value = headers[headerKey];
    // Axios headers can be string, string[], number, boolean, or null
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) {
      return String(value[0]);
    }
    return String(value);
  };

  // Check for standard retry-after header (in seconds)
  const retryAfter = getHeader("retry-after");
  if (retryAfter) {
    const seconds = parseInt(String(retryAfter), 10);
    if (!isNaN(seconds)) {
      return seconds * 1000; // Convert to milliseconds
    }
  }

  // Check for Shopify-specific header
  const shopifyRetryAfter = getHeader("x-shopify-retry-after");
  if (shopifyRetryAfter) {
    const seconds = parseInt(String(shopifyRetryAfter), 10);
    if (!isNaN(seconds)) {
      return seconds * 1000; // Convert to milliseconds
    }
  }

  return 0; // No retry-after header found
}

/**
 * Calculates exponential backoff delay
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds (default: 1000ms)
 * @param maxDelay - Maximum delay in milliseconds (default: 60000ms = 1 minute)
 */
function calculateExponentialBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 60000
): number {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an API call with retry logic, exponential backoff, and rate limit handling
 * @param apiCall - Function that returns a Promise with the API call
 * @param maxRetries - Maximum number of retries (default: 5)
 * @param operationName - Name of the operation for logging (optional)
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 5,
  operationName?: string
): Promise<T> {
  let lastError: AxiosError | Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as AxiosError | Error;

      // Check if it's an HTTP 429 (Too Many Requests)
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = getRetryAfterDelay(error);

        if (attempt < maxRetries) {
          const delay =
            retryAfter > 0 ? retryAfter : calculateExponentialBackoff(attempt);

          const opName = operationName ? `${operationName} - ` : "";
          console.log(
            chalk.yellow(
              `⚠️  ${opName}Rate limited (429). Waiting ${Math.ceil(
                delay / 1000
              )}s before retry (attempt ${attempt + 1}/${maxRetries + 1})...`
            )
          );

          await sleep(delay);
          continue;
        }
      }

      // For other errors, use exponential backoff
      if (attempt < maxRetries) {
        const delay = calculateExponentialBackoff(attempt);

        const opName = operationName ? `${operationName} - ` : "";
        const status =
          axios.isAxiosError(error) && error.response?.status
            ? ` (${error.response.status})`
            : "";

        console.log(
          chalk.yellow(
            `⚠️  ${opName}Request failed${status}. Retrying in ${Math.ceil(
              delay / 1000
            )}s (attempt ${attempt + 1}/${maxRetries + 1})...`
          )
        );

        await sleep(delay);
        continue;
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error("Unknown error occurred");
}
