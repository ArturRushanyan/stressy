/**
 * A utility class for generating dynamic data for stress test requests.
 *
 * The DataGenerator class processes data templates and replaces placeholders
 * with dynamic values based on request context. This is useful for creating
 * unique data for each request in stress tests.
 *
 * @example
 * ```javascript
 * import { DataGenerator } from './generators/DataGenerator.js';
 *
 * const generator = new DataGenerator();
 *
 * // Generate dynamic data
 * const data = generator.generateDynamicData({
 *   id: '{id}',
 *   name: 'User {id}',
 *   email: 'user{id}@example.com',
 *   randomValue: '{randomNumber:100}',
 *   timestamp: '{timestamp}'
 * }, 123);
 *
 * // Result: {
 * //   id: '123',
 * //   name: 'User 123',
 * //   email: 'user123@example.com',
 * //   randomValue: 42, // random number 0-99
 * //   timestamp: 1640995200000
 * // }
 * ```
 *
 * @since 1.0.0
 * @author ArthurRushanyan
 */
export class DataGenerator {
  /**
   * Generates dynamic data from a template object.
   *
   * Processes the template object and replaces placeholders with dynamic values
   * based on the request ID and current context.
   *
   * @param {Object} template - Data template object with placeholder strings
   * @param {number} requestId - Unique request identifier
   * @returns {Object} Processed data object with dynamic values
   *
   * @example
   * ```javascript
   * const template = {
   *   userId: '{id}',
   *   name: 'Test User {id}',
   *   score: '{randomNumber:1000}',
   *   createdAt: '{timestamp}'
   * };
   *
   * const data = generator.generateDynamicData(template, 456);
   * // Result: {
   * //   userId: '456',
   * //   name: 'Test User 456',
   * //   score: 742,
   * //   createdAt: 1640995200000
   * // }
   * ```
   */
  generateDynamicData(template, requestId) {
    const data = { ...template };
    return this.#processObject(data, requestId);
  }

  /**
   * Processes an object recursively, replacing placeholders in all values.
   *
   * @private
   * @param {Object} obj - Object to process
   * @param {number} requestId - Request identifier for placeholder replacement
   * @returns {Object} Processed object with replaced placeholders
   */
  #processObject(obj, requestId) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.#processValue(value, requestId);
    }

    return result;
  }

  /**
   * Processes a single value, handling different data types.
   *
   * @private
   * @param {*} value - Value to process
   * @param {number} requestId - Request identifier for placeholder replacement
   * @returns {*} Processed value
   */
  #processValue(value, requestId) {
    if (typeof value === "string") {
      return this.#processString(value, requestId);
    } else if (typeof value === "object" && value !== null) {
      return this.#processObject(value, requestId);
    } else {
      return value;
    }
  }

  /**
   * Processes a string and replaces all supported placeholders.
   *
   * Supported placeholders:
   * - `{id}` - Request ID
   * - `{timestamp}` - Current timestamp
   * - `{randomNumber:n}` - Random number between 0 and n-1
   * - `{randomString:n}` - Random string of length n
   *
   * @private
   * @param {string} str - String to process
   * @param {number} requestId - Request identifier
   * @returns {string|number} Processed string or number (for randomNumber)
   */
  #processString(str, requestId) {
    return str
      .replace(/\{id\}/g, requestId)
      .replace(/\{timestamp\}/g, Date.now())
      .replace(/\{randomNumber:(\d+)\}/g, (match, max) =>
        Math.floor(Math.random() * parseInt(max))
      )
      .replace(/\{randomString:(\d+)\}/g, (match, length) =>
        this.#generateRandomString(parseInt(length))
      );
  }

  /**
   * Generates a random string of specified length.
   *
   * @private
   * @param {number} length - Length of the random string
   * @returns {string} Random string containing alphanumeric characters
   */
  #generateRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
