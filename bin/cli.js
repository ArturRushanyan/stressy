#!/usr/bin/env node

/**
 * @fileoverview Command-line interface for the Node.js Stress Tester.
 *
 * This CLI tool provides a convenient way to run stress tests from the command line
 * without writing JavaScript code. It supports all major configuration options
 * and provides real-time progress reporting.
 *
 * @example
 * ```bash
 * # Basic usage
 * stress-tester --url "https://api.example.com/users" --rps 100 --requests 1000
 *
 * # With custom headers and body
 * stress-tester --url "https://api.example.com/users" --rps 50 --requests 500 \
 *   --method POST --headers '{"Authorization": "Bearer token"}' \
 *   --body '{"name": "Test User"}'
 *
 * # Duration-based test
 * stress-tester --url "https://api.example.com/users" --rps 200 --duration 60
 *
 * # Silent mode (no terminal output)
 * stress-tester --url "https://api.example.com/users" --rps 100 --requests 1000 --silent
 * ```
 *
 * @since 1.0.0
 * @author ArthurRushanyan
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import StressTester from "../src/index.js";

const argv = yargs(hideBin(process.argv))
  .option("url", {
    alias: "u",
    type: "string",
    description: "Target URL",
  })
  .option("requests", {
    alias: "r",
    type: "number",
    description: "Total number of requests",
  })
  .option("rps", {
    type: "number",
    description: "Requests per second",
  })
  .option("duration", {
    alias: "d",
    type: "number",
    description: "Test duration in seconds",
  })
  .option("method", {
    alias: "m",
    type: "string",
    default: "GET",
    description: "HTTP method",
  })
  .option("headers", {
    type: "string",
    description: "Headers as JSON string",
  })
  .option("body", {
    type: "string",
    description: "Request body as JSON string",
  })
  .option("silent", {
    alias: "s",
    type: "boolean",
    default: false,
    description:
      "Silent mode - disable all terminal output and progress reporting",
  })
  .demandOption(["url", "rps"]).argv;

/**
 * Main function that parses command-line arguments and runs the stress test.
 *
 * Processes command-line arguments, validates configuration, and executes
 * the stress test with the provided parameters.
 *
 * @async
 * @function main
 * @throws {Error} When configuration is invalid or test execution fails
 *
 * @example
 * ```bash
 * # The main function is called automatically when the CLI is executed
 * stress-tester --url "https://api.example.com/users" --rps 100 --requests 1000
 * ```
 */
async function main() {
  const config = {
    url: argv.url,
    requestsPerSecond: argv.rps,
    method: argv.method,
    silent: argv.silent,
  };

  if (argv.requests) config.totalRequests = argv.requests;
  if (argv.duration) config.duration = argv.duration;
  if (argv.headers) config.headers = JSON.parse(argv.headers);
  if (argv.body) config.body = JSON.parse(argv.body);

  const tester = new StressTester();

  try {
    await tester.runStressTest(config);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
