/**
 * Validates stress test configuration and ensures all required parameters are present.
 *
 * Performs comprehensive validation of the test configuration object, checking
 * for required parameters, valid data types, and logical constraints.
 *
 * @param {Object} config - Test configuration object to validate
 * @param {string} [config.url] - Complete URL for requests
 * @param {string} [config.baseURL] - Base URL for requests
 * @param {string} [config.endpoint] - API endpoint path
 * @param {number} config.requestsPerSecond - Requests per second rate
 * @param {number} [config.totalRequests] - Total number of requests
 * @param {number} [config.duration] - Test duration in seconds
 * @param {number[]} [config.rampUp] - Ramp-up configuration array
 *
 * @returns {Object} Validated configuration object
 *
 * @throws {Error} When configuration validation fails with detailed error messages
 *
 * @example
 * ```javascript
 * // Valid configuration
 * const config = validateConfig({
 *   url: 'https://api.example.com/users',
 *   requestsPerSecond: 100,
 *   totalRequests: 1000
 * });
 *
 * // Invalid configuration - will throw error
 * try {
 *   validateConfig({
 *     requestsPerSecond: 0, // Invalid: must be positive
 *     // Missing required parameters
 *   });
 * } catch (error) {
 *   console.error(error.message);
 *   // Output: Configuration errors:
 *   // Either "url" or both "baseURL" and "endpoint" must be provided
 *   // "requestsPerSecond" must be a positive number
 *   // Either "totalRequests" or "duration" must be provided
 * }
 * ```
 *
 * @since 1.0.0
 * @author ArthurRushanyan
 */
export function validateConfig(config) {
  const errors = [];

  if (!config.url && (!config.baseURL || !config.endpoint)) {
    errors.push(
      'Either "url" or both "baseURL" and "endpoint" must be provided'
    );
  }

  if (!config.requestsPerSecond || config.requestsPerSecond <= 0) {
    errors.push('"requestsPerSecond" must be a positive number');
  }

  if (!config.totalRequests && !config.duration) {
    errors.push('Either "totalRequests" or "duration" must be provided');
  }

  if (config.rampUp && !Array.isArray(config.rampUp)) {
    errors.push('"rampUp" must be an array of numbers');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }

  return config;
}
