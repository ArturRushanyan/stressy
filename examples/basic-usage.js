/**
 * @fileoverview Basic usage examples for the Node.js Stress Tester.
 *
 * This file demonstrates common usage patterns and features of the stress tester,
 * including basic GET requests and POST requests with dynamic data generation.
 *
 * @example
 * ```bash
 * # Run the examples
 * npm run dev
 * # or
 * node examples/basic-usage.js
 * ```
 *
 * @since 1.0.0
 * @author ArthurRushanyan
 */

import { StressTester, JSONReporter } from "../src/index.js";

/**
 * Demonstrates various stress testing scenarios.
 *
 * This function runs multiple stress test examples to showcase different
 * features and usage patterns of the stress tester library.
 *
 * @async
 * @function runExamples
 * @throws {Error} When test execution fails
 *
 * @example
 * ```javascript
 * // Run all examples
 * runExamples().catch(console.error);
 * ```
 */
async function runExamples() {
  const tester = new StressTester();

  console.log("=== Basic Stress Test ===");
  await tester.runStressTest({
    url: "http://jsonplaceholder.typicode.com/get",
    method: "GET",
    totalRequests: 1,
    requestsPerSecond: 1,
  });

  console.log("\n=== Test with Dynamic Data ===");
  await tester.runStressTest({
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      title: "Test Post {id}",
      body: "This is test content for request {id}",
      userId: "{randomNumber:100}",
    },
    dynamicData: true,
    totalRequests: 1,
    requestsPerSecond: 1,
  });

  console.log("\n=== Silent Mode Test ===");
  await tester.runStressTest({
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "GET",
    totalRequests: 100,
    requestsPerSecond: 20,
    silent: true,
  });

  const statistics = tester.getStatistics();

  console.log("Statistics: ", statistics);
}

runExamples().catch(console.error);
