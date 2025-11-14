import EventEmitter from "events";
import axios from "axios";
import { performance } from "perf_hooks";
import { ConsoleReporter } from "./reporters/ConsoleReporter.js";
import { DataGenerator } from "./generators/DataGenerator.js";
import { calculateStatistics, validateConfig } from "./utils/index.js";

/**
 * A comprehensive HTTP stress testing library for Node.js applications.
 *
 * The StressTester class provides functionality to perform load testing,
 * stress testing, and performance testing of HTTP APIs and web services.
 * It supports both constant rate and ramp-up testing patterns with real-time
 * progress reporting and detailed statistics.
 *
 * @example
 * ```javascript
 * const tester = new StressTester();
 *
 * // Basic usage
 * await tester.runStressTest({
 *   url: 'https://api.example.com/users',
 *   requestsPerSecond: 100,
 *   totalRequests: 1000
 * });
 *
 * // With custom configuration
 * await tester.runStressTest({
 *   baseURL: 'https://api.example.com',
 *   endpoint: '/users',
 *   method: 'POST',
 *   headers: { 'Authorization': 'Bearer token' },
 *   body: { name: 'Test User' },
 *   requestsPerSecond: 50,
 *   duration: 60
 * });
 * ```
 *
 * @extends EventEmitter
 * @since 1.0.0
 * @author ArthurRushanyan
 */
export class StressTester extends EventEmitter {
  /**
   * Creates a new StressTester instance.
   *
   * @param {Object} [config={}] - Configuration options for the stress tester
   * @param {string} [config.baseURL=""] - Base URL for all requests
   * @param {number} [config.timeout=5000] - Request timeout in milliseconds
   * @param {number} [config.maxRetries=3] - Maximum number of retries for failed requests
   * @param {number} [config.reportInterval=1000] - Progress reporting interval in milliseconds
   * @param {Object} [config.reporter] - Custom reporter instance (defaults to ConsoleReporter)
   * @param {Object} [config.dataGenerator] - Custom data generator instance (defaults to DataGenerator)
   * @param {boolean} [config.silent=false] - Silent mode disables all terminal output and progress reporting
   *
   * @example
   * ```javascript
   * // Basic configuration
   * const tester = new StressTester();
   *
   * // With custom configuration
   * const tester = new StressTester({
   *   baseURL: 'https://api.example.com',
   *   timeout: 10000,
   *   maxRetries: 5
   * });
   *
   * // Silent mode configuration
   * const silentTester = new StressTester({
   *   silent: true
   * });
   * ```
   */
  constructor(config = {}) {
    super();

    this.config = {
      baseURL: "",
      timeout: 5000,
      maxRetries: 3,
      reportInterval: 1000,
      silent: false,
      ...config,
    };

    this.state = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      startTime: null,
      isRunning: false,
      requestsPerSecond: 0,
      responseTimes: [],
    };

    if (!this.config.silent) {
      this.reporter = config.reporter || new ConsoleReporter();
    } else {
      this.reporter = null;
    }

    this.dataGenerator = config.dataGenerator || new DataGenerator();
    this.activeRequests = new Set();
  }

  /**
   * Executes a stress test with the provided configuration.
   *
   * This method runs either a constant rate test or a ramp-up test based on
   * the configuration provided. It emits events throughout the test lifecycle
   * and provides detailed progress reporting.
   *
   * @param {Object} options - Test configuration options
   * @param {string} [options.url] - Complete URL for the request (alternative to baseURL + endpoint)
   * @param {string} [options.baseURL] - Base URL for requests
   * @param {string} [options.endpoint] - API endpoint path
   * @param {string} [options.method="GET"] - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {Object} [options.headers={}] - HTTP headers to include with requests
   * @param {Object|Function} [options.body] - Request body (object, function, or string)
   * @param {boolean} [options.dynamicData=false] - Whether to generate dynamic data for request body
   * @param {number} options.requestsPerSecond - Number of requests to send per second
   * @param {number} [options.totalRequests] - Total number of requests to send
   * @param {number} [options.duration] - Test duration in seconds (alternative to totalRequests)
   * @param {number[]} [options.rampUp] - Array of RPS values for ramp-up testing
   * @param {number} [options.maxRequestsPerSecond] - Maximum RPS limit for ramp-up tests
   * @param {number} [options.timeout] - Request timeout in milliseconds
   * @param {number} [options.maxRetries] - Maximum retry attempts for failed requests
   * @param {boolean} [options.silent] - Silent mode disables all terminal output and progress reporting
   *
   * @returns {Promise<Object>} Test results object containing statistics
   *
   * @fires StressTester#testStart - Emitted when test starts
   * @fires StressTester#progress - Emitted during test execution with progress data
   * @fires StressTester#requestComplete - Emitted for each completed request
   * @fires StressTester#stageComplete - Emitted when ramp-up stage completes
   * @fires StressTester#testComplete - Emitted when test completes
   * @fires StressTester#error - Emitted when an error occurs
   *
   * @example
   * ```javascript
   * // Constant rate test
   * const results = await tester.runStressTest({
   *   url: 'https://api.example.com/users',
   *   requestsPerSecond: 100,
   *   totalRequests: 1000
   * });
   *
   * // Ramp-up test
   * const results = await tester.runStressTest({
   *   baseURL: 'https://api.example.com',
   *   endpoint: '/users',
   *   requestsPerSecond: 10,
   *   rampUp: [10, 50, 100, 200],
   *   duration: 60
   * });
   *
   * // POST request with dynamic data
   * const results = await tester.runStressTest({
   *   url: 'https://api.example.com/users',
   *   method: 'POST',
   *   body: { name: 'User {id}', email: 'user{id}@example.com' },
   *   dynamicData: true,
   *   requestsPerSecond: 50,
   *   totalRequests: 500
   * });
   *
   * // Silent test (no terminal output)
   * const silentResults = await tester.runStressTest({
   *   url: 'https://api.example.com/users',
   *   requestsPerSecond: 100,
   *   totalRequests: 1000,
   *   silent: true
   * });
   * ```
   *
   * @throws {Error} When configuration is invalid
   * @throws {Error} When test execution fails
   */
  async runStressTest(options) {
    const testConfig = validateConfig({
      ...this.config,
      ...options,
    });

    this.state.startTime = performance.now();
    this.state.isRunning = true;

    this.emit("testStart", testConfig);
    if (!this.config.silent) {
      this.reporter.onTestStart(testConfig);
    }

    try {
      if (testConfig.rampUp) {
        await this.#executeRampUpTest(testConfig);
      } else {
        await this.#executeConstantRateTest(testConfig);
      }
    } catch (error) {
      this.emit("error", error);
      throw error;
    } finally {
      this.#cleanup();
    }
  }

  async #executeConstantRateTest(config) {
    const { totalRequests, requestsPerSecond, duration } = config;
    const totalCalls = totalRequests || duration * requestsPerSecond;
    const batches = Math.ceil(totalCalls / requestsPerSecond);

    for (let batch = 0; batch < batches && this.state.isRunning; batch++) {
      const batchStartTime = performance.now();
      const batchSize = Math.min(
        requestsPerSecond,
        totalCalls - this.state.totalRequests
      );

      const promises = [];
      for (let i = 0; i < batchSize; i++) {
        promises.push(this.#executeSingleRequest(config));
      }

      await Promise.allSettled(promises);

      const batchEndTime = performance.now();
      const batchDuration = batchEndTime - batchStartTime;
      const waitTime = Math.max(0, 1000 - batchDuration);

      if (batch < batches - 1 && waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      this.#updateMetrics();
      this.#reportProgress(batch + 1, batches);
    }
  }

  async #executeRampUpTest(config) {
    const { rampUp, duration, maxRequestsPerSecond } = config;
    const stages = rampUp.length;
    const stageDuration = duration / stages;

    for (let stage = 0; stage < stages && this.state.isRunning; stage++) {
      const targetRPS = rampUp[stage];
      const stageEndTime = performance.now() + stageDuration * 1000;

      while (performance.now() < stageEndTime && this.state.isRunning) {
        const batchStartTime = performance.now();
        const currentRPS = Math.min(
          targetRPS,
          maxRequestsPerSecond || targetRPS
        );

        const promises = [];
        for (let i = 0; i < currentRPS; i++) {
          promises.push(this.#executeSingleRequest(config));
        }

        await Promise.allSettled(promises);

        const batchDuration = performance.now() - batchStartTime;
        const waitTime = Math.max(0, 1000 - batchDuration);

        if (waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        this.#updateMetrics();
      }

      this.emit("stageComplete", { stage: stage + 1, rps: targetRPS });
    }
  }

  async #executeSingleRequest(config) {
    const requestId = this.state.totalRequests + 1;
    const requestStartTime = performance.now();

    const requestConfig = {
      method: config.method || "GET",
      url: this.#buildURL(config),
      headers: this.#buildHeaders(config),
      data: this.#buildRequestBody(config, requestId),
      timeout: config.timeout,
      validateStatus: (status) => status >= 200 && status < 300,
    };

    try {
      const response = await axios(requestConfig);
      const requestDuration = Number(
        (performance.now() - requestStartTime).toFixed(2)
      );

      const result = {
        id: requestId,
        success: response.status >= 200 && response.status < 300,
        statusCode: response.status,
        responseTime: requestDuration,
        timestamp: Date.now(),
        error: null,
      };

      this.state.responseTimes.push(requestDuration);

      if (result.success) {
        this.state.successfulRequests++;
      } else {
        this.state.failedRequests++;
      }

      this.state.totalResponseTime += responseTime;
      this.emit("requestComplete", result);
    } catch (error) {
      this.emit("erorDuringRequest", error);
      const requestDuration = Number(
        (performance.now() - requestStartTime).toFixed(2)
      );
      this.state.failedRequests++;
      this.state.totalResponseTime += responseTime;

      this.state.responseTimes.push(requestDuration);

      const result = {
        id: requestId,
        success: false,
        statusCode: 0,
        responseTime: requestDuration,
        timestamp: Date.now(),
        error: error.message,
      };

      this.emit("requestComplete", result);
    } finally {
      this.state.totalRequests++;
    }
  }

  #buildURL(config) {
    if (config.url) return config.url;
    return `${config.baseURL}${config.endpoint || ""}`;
  }

  #buildHeaders(config) {
    const headers = { ...config.headers };

    if (config.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  #buildRequestBody(config, requestId) {
    if (!config.body) return undefined;

    if (typeof config.body === "function") {
      return config.body(requestId);
    }

    if (typeof config.body === "object" && config.dynamicData) {
      return this.dataGenerator.generateDynamicData(config.body, requestId);
    }

    return config.body;
  }

  #updateMetrics() {
    const elapsedSeconds = (performance.now() - this.state.startTime) / 1000;
    this.state.requestsPerSecond = this.state.totalRequests / elapsedSeconds;
  }

  #reportProgress(currentBatch, totalBatches) {
    const progress = {
      currentBatch,
      totalBatches,
      totalRequests: this.state.totalRequests,
      successfulRequests: this.state.successfulRequests,
      failedRequests: this.state.failedRequests,
      requestsPerSecond: this.state.requestsPerSecond,
      averageResponseTime:
        this.state.totalResponseTime / this.state.totalRequests || 0,
    };

    this.emit("progress", progress);
    if (!this.config.silent) {
      this.reporter.onProgress(progress);
    }
  }

  #cleanup() {
    this.state.isRunning = false;
    const endTime = performance.now();
    const totalTime = (endTime - this.state.startTime) / 1000;

    const results = {
      totalTime,
      totalRequests: this.state.totalRequests,
      successfulRequests: this.state.successfulRequests,
      failedRequests: this.state.failedRequests,
      successRate:
        (this.state.successfulRequests / this.state.totalRequests) * 100,
      averageResponseTime:
        this.state.totalResponseTime / this.state.totalRequests || 0,
      requestsPerSecond: this.state.totalRequests / totalTime,
      responseTimes: this.state.responseTimes,
    };

    this.emit("testComplete", results);

    if (!this.config.silent) {
      this.reporter.onTestComplete(results);
    }
  }

  /**
   * Stops the currently running stress test.
   *
   * This method gracefully stops the test execution and emits a 'testStopped' event.
   * The test will complete any in-progress requests before stopping.
   *
   * @fires StressTester#testStopped - Emitted when test is stopped
   *
   * @example
   * ```javascript
   * const tester = new StressTester();
   *
   * // Start a long-running test
   * const testPromise = tester.runStressTest({
   *   url: 'https://api.example.com/users',
   *   requestsPerSecond: 100,
   *   duration: 300 // 5 minutes
   * });
   *
   * // Stop after 1 minute
   * setTimeout(() => {
   *   tester.stop();
   * }, 60000);
   * ```
   */
  stop() {
    this.state.isRunning = false;
    this.emit("testStopped");
  }

  /**
   * Gets the current test state and statistics.
   *
   * Returns a snapshot of the current test state including request counts,
   * success rates, and performance metrics.
   *
   * @returns {Object} Current test state object
   * @returns {number} returns.totalRequests - Total number of requests sent
   * @returns {number} returns.successfulRequests - Number of successful requests
   * @returns {number} returns.failedRequests - Number of failed requests
   * @returns {number} returns.totalResponseTime - Total response time in milliseconds
   * @returns {number|null} returns.startTime - Test start time (performance.now())
   * @returns {boolean} returns.isRunning - Whether test is currently running
   * @returns {number} returns.requestsPerSecond - Current requests per second rate
   *
   * @example
   * ```javascript
   * const tester = new StressTester();
   *
   * // Start a test
   * tester.runStressTest({
   *   url: 'https://api.example.com/users',
   *   requestsPerSecond: 100,
   *   totalRequests: 1000
   * });
   *
   * // Check progress
   * const state = tester.getResults();
   * console.log(`Completed: ${state.totalRequests} requests`);
   * console.log(`Success rate: ${(state.successfulRequests / state.totalRequests * 100).toFixed(2)}%`);
   * ```
   */
  getResults() {
    return { ...this.state };
  }

  getStatistics() {
    return calculateStatistics(this.state.responseTimes);
  }
}
