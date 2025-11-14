import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig } from "../src/utils/validators.js";

// Happy paths
test("validateConfig: valid with url + requestsPerSecond + totalRequests", () => {
  const cfg = {
    url: "https://api.example.com/users",
    requestsPerSecond: 10,
    totalRequests: 100,
  };
  const result = validateConfig(cfg);
  assert.equal(result, cfg);
});

test("validateConfig: valid with baseURL + endpoint + requestsPerSecond + duration", () => {
  const cfg = {
    baseURL: "https://api.example.com",
    endpoint: "/users",
    requestsPerSecond: 5,
    duration: 30,
  };
  const result = validateConfig(cfg);
  assert.equal(result, cfg);
});

test("validateConfig: allows rampUp when it is an array (no content validation)", () => {
  const cfg = {
    url: "https://api.example.com/users",
    requestsPerSecond: 20,
    totalRequests: 200,
    rampUp: [1, 2, 3],
  };
  const result = validateConfig(cfg);
  assert.equal(result, cfg);
});

// Error cases
test("validateConfig: errors when neither url nor (baseURL and endpoint) provided", () => {
  const cfg = {
    requestsPerSecond: 10,
    totalRequests: 100,
  };
  assert.throws(
    () => validateConfig(cfg),
    /Either "url" or both "baseURL" and "endpoint" must be provided/
  );
});

test("validateConfig: errors when requestsPerSecond is missing", () => {
  const cfg = {
    url: "https://api.example.com/users",
    totalRequests: 100,
  };
  assert.throws(
    () => validateConfig(cfg),
    /"requestsPerSecond" must be a positive number/
  );
});

test("validateConfig: errors when requestsPerSecond is not positive", () => {
  const zero = { url: "https://x", requestsPerSecond: 0, totalRequests: 10 };
  const negative = {
    url: "https://x",
    requestsPerSecond: -1,
    totalRequests: 10,
  };

  assert.throws(
    () => validateConfig(zero),
    /"requestsPerSecond" must be a positive number/
  );
  assert.throws(
    () => validateConfig(negative),
    /"requestsPerSecond" must be a positive number/
  );
});

test("validateConfig: errors when both totalRequests and duration are missing", () => {
  const cfg = {
    url: "https://api.example.com/users",
    requestsPerSecond: 10,
  };
  assert.throws(
    () => validateConfig(cfg),
    /Either "totalRequests" or "duration" must be provided/
  );
});

test("validateConfig: errors when rampUp is provided but not an array", () => {
  const bads = [{ rampUp: "not-array" }, { rampUp: 123 }, { rampUp: { a: 1 } }];

  for (const extra of bads) {
    const cfg = {
      url: "https://api.example.com/users",
      requestsPerSecond: 10,
      totalRequests: 100,
      ...extra,
    };
    assert.throws(
      () => validateConfig(cfg),
      /"rampUp" must be an array of numbers/
    );
  }
});
