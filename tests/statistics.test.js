import test from "node:test";
import assert from "node:assert/strict";
import { calculateStatistics } from "../src/utils/statistics.js";

test("Statistics: calculation", () => {
  const expectedResult = { min: 1, max: 6, avg: 3.5, p95: 5.75, p99: 5.95 };
  const statistics = [1, 2, 3, 4, 5, 6];

  const result = calculateStatistics(statistics);

  assert.deepStrictEqual(result, expectedResult);
});

test("Statistics: one value in array", () => {
  const expectedResult = { min: 10, max: 10, avg: 10, p95: 10, p99: 10 };
  const statistics = [10];

  const result = calculateStatistics(statistics);

  assert.deepStrictEqual(result, expectedResult);
});

test("Statistics: empty array ", () => {
  const expectedResult = {};
  const statistics = [];

  const result = calculateStatistics(statistics);

  assert.deepStrictEqual(result, expectedResult);
});

test("Statistics: Null instead of statistics array ", () => {
  const expectedResult = {};
  const statistics = null;

  const result = calculateStatistics(statistics);

  assert.deepStrictEqual(result, expectedResult);
});

test("Statistics: percentiles on small range", () => {
  const stats = calculateStatistics([1, 2, 3, 4, 5, 6]);

  assert.strictEqual(stats.p95, 5.75);
  assert.strictEqual(stats.p99, 5.95);
});

test("Statistics: percentiles when all numbers are equal", () => {
  const stats = calculateStatistics([5, 5, 5, 5, 5]);

  assert.strictEqual(stats.p95, 5);
  assert.strictEqual(stats.p99, 5);
});

test("Statistics: increasing large numbers", () => {
  const stats = calculateStatistics([10, 20, 30, 40, 50]);

  assert.ok(stats.p95 > stats.avg);
  assert.ok(stats.p99 >= stats.p95);
});
