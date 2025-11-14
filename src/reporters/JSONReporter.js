/**
 * A JSON-based reporter that outputs structured data for programmatic consumption.
 *
 * This reporter outputs all test events and results as JSON objects, making it
 * suitable for integration with monitoring systems, CI/CD pipelines, or data
 * analysis tools.
 *
 * @example
 * ```javascript
 * import { JSONReporter } from './reporters/JSONReporter.js';
 *
 * const reporter = new JSONReporter();
 * const tester = new StressTester({ reporter });
 * ```
 *
 * @since 1.0.0
 * @author ArthurRushanyan
 */
export class JSONReporter {
  /**
   * Called when a stress test starts.
   *
   * Outputs test configuration as a JSON object with event type.
   *
   * @param {Object} config - Test configuration object
   */
  onTestStart(config) {
    console.log(JSON.stringify({ event: "testStart", config }, null, 2));
  }

  /**
   * Called during test execution to report progress.
   *
   * Outputs current progress statistics as a JSON object.
   *
   * @param {Object} progress - Progress information object
   * @param {number} progress.totalRequests - Total requests completed
   * @param {number} progress.successfulRequests - Number of successful requests
   * @param {number} progress.failedRequests - Number of failed requests
   * @param {number} progress.requestsPerSecond - Current requests per second rate
   * @param {number} progress.averageResponseTime - Average response time in milliseconds
   */
  onProgress(progress) {
    console.log(JSON.stringify({ event: "progress", ...progress }, null, 2));
  }

  /**
   * Called when a stress test completes.
   *
   * Outputs final test results as a JSON object with event type.
   *
   * @param {Object} results - Final test results object
   * @param {number} results.totalTime - Total test duration in seconds
   * @param {number} results.totalRequests - Total number of requests sent
   * @param {number} results.successfulRequests - Number of successful requests
   * @param {number} results.failedRequests - Number of failed requests
   * @param {number} results.successRate - Success rate percentage
   * @param {number} results.averageResponseTime - Average response time in milliseconds
   * @param {number} results.requestsPerSecond - Final requests per second rate
   */
  onTestComplete(results) {
    console.log(JSON.stringify({ event: "testComplete", results }, null, 2));
  }
}
