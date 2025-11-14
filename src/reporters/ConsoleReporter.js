import chalk from "chalk";
import cliProgress from "cli-progress";

/**
 * A console-based reporter that provides real-time progress visualization
 * and colored output for stress test results.
 *
 * This reporter displays a progress bar during test execution and provides
 * detailed statistics with color-coded output for better readability.
 *
 * @example
 * ```javascript
 * import { ConsoleReporter } from './reporters/ConsoleReporter.js';
 *
 * const reporter = new ConsoleReporter();
 * const tester = new StressTester({ reporter });
 * ```
 *
 * @since 1.0.0
 * @author ArthurRushanyan
 */
export class ConsoleReporter {
  constructor() {
    this.progressBar = new cliProgress.SingleBar({
      format:
        "Progress |" +
        chalk.cyan("{bar}") +
        "| {percentage}% | {value}/{total} Requests",
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true,
    });
  }

  /**
   * Called when a stress test starts.
   *
   * Displays test configuration information and initializes the progress bar.
   *
   * @param {Object} config - Test configuration object
   * @param {string} config.url - Target URL
   * @param {string} [config.baseURL] - Base URL
   * @param {string} [config.endpoint] - API endpoint
   * @param {string} [config.method="GET"] - HTTP method
   * @param {number} config.requestsPerSecond - Requests per second rate
   * @param {number} [config.totalRequests] - Total number of requests
   * @param {number} [config.duration] - Test duration in seconds
   */
  onTestStart(config) {
    console.log(chalk.bold.blue("\n🚀 Starting Stress Test"));
    console.log(
      chalk.gray(`Target: ${config.totalRequests || "Duration-based"} requests`)
    );
    console.log(
      chalk.gray(`Rate: ${config.requestsPerSecond} requests/second`)
    );
    console.log(chalk.gray(`Method: ${config.method}`));
    console.log(
      chalk.gray(`URL: ${config.url || config.baseURL + config.endpoint}\n`)
    );

    const totalRequests =
      config.totalRequests || config.duration * config.requestsPerSecond;
    this.progressBar.start(totalRequests, 0);
  }

  /**
   * Called during test execution to update progress display.
   *
   * Updates the progress bar with current statistics and request counts.
   *
   * @param {Object} progress - Progress information object
   * @param {number} progress.totalRequests - Total requests completed
   * @param {number} progress.successfulRequests - Number of successful requests
   * @param {number} progress.failedRequests - Number of failed requests
   * @param {number} progress.requestsPerSecond - Current requests per second rate
   * @param {number} progress.averageResponseTime - Average response time in milliseconds
   */
  onProgress(progress) {
    this.progressBar.update(progress.totalRequests, {
      rps: progress.requestsPerSecond.toFixed(2),
      success: progress.successfulRequests,
      failed: progress.failedRequests,
    });
  }

  /**
   * Called when a stress test completes.
   *
   * Displays final test results with color-coded statistics and performance metrics.
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
    this.progressBar.stop();

    console.log("\n" + chalk.bold.green("Test Results"));
    console.log(chalk.gray(`Total Time: ${results.totalTime.toFixed(2)}s`));
    console.log(chalk.green(`Successful: ${results.successfulRequests}`));
    console.log(chalk.red(`Failed: ${results.failedRequests}`));
    console.log(chalk.blue(`Success Rate: ${results.successRate.toFixed(2)}%`));
    console.log(
      chalk.yellow(
        `Average Response Time: ${results.averageResponseTime.toFixed(2)}ms`
      )
    );
    console.log(
      chalk.cyan(`Requests/Second: ${results.requestsPerSecond.toFixed(2)}`)
    );

    if (results.failedRequests > 0) {
      console.log(
        chalk.red("\n⚠️  Some requests failed. Check the configuration.")
      );
    }
  }
}
