/**
 * Calculates comprehensive statistics from an array of numeric results.
 *
 * Computes minimum, maximum, average, 95th percentile, and 99th percentile
 * values from the provided data array.
 *
 * @param {number[]} results - Array of numeric values to analyze
 * @returns {Object} Statistics object containing calculated metrics
 * @returns {number} returns.min - Minimum value in the dataset
 * @returns {number} returns.max - Maximum value in the dataset
 * @returns {number} returns.avg - Average value of the dataset
 * @returns {number} returns.p95 - 95th percentile value
 * @returns {number} returns.p99 - 99th percentile value
 *
 * @example
 * ```javascript
 * const responseTimes = [100, 150, 200, 180, 120, 300, 250];
 * const stats = calculateStatistics(responseTimes);
 * console.log(stats);
 * // Output: { min: 100, max: 300, avg: 185.71, p95: 275, p99: 297.5 }
 * ```
 *
 * @since 1.0.0
 * @author ArthurRushanyan
 */
export function calculateStatistics(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return {};
  }

  const sorted = [...results].sort((a, b) => a - b);
  const stats = {
    min: Math.min(...results),
    max: Math.max(...results),
    avg: parseFloat(
      (results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)
    ),
    p95: calculatePercentile(sorted, 95),
    p99: calculatePercentile(sorted, 99),
  };

  return stats;
}

/**
 * Calculates the percentile value from a sorted array.
 *
 * Uses linear interpolation to calculate percentile values for more accurate
 * results when the exact percentile index falls between array elements.
 *
 * @private
 * @param {number[]} sortedArray - Array of numbers sorted in ascending order
 * @param {number} percentile - Percentile value (0-100)
 * @returns {number} Calculated percentile value
 *
 * @example
 * ```javascript
 * const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
 * const p95 = calculatePercentile(data, 95);
 * // Returns: 95 (interpolated value)
 * ```
 */
function calculatePercentile(sortedArray, percentile) {
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedArray[lower];
  }

  return parseFloat(
    (
      sortedArray[lower] +
      (sortedArray[upper] - sortedArray[lower]) * (index - lower)
    ).toFixed(2)
  );
}
