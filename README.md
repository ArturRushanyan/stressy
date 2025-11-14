# Node.js stressy

A comprehensive HTTP stress testing library for Node.js applications. Perform load testing, stress testing, and performance testing of HTTP APIs and web services with both constant rate and ramp-up testing patterns.

## Features

- 🚀 **High Performance**: Efficient request handling with configurable RPS
- 📊 **Real-time Reporting**: Live progress bars and detailed statistics
- 🔄 **Multiple Test Patterns**: Constant rate and ramp-up testing
- 🎯 **Flexible Configuration**: Support for all HTTP methods and custom headers
- 📝 **Dynamic Data**: Generate dynamic request bodies with templates
- 🔇 **Silent Mode**: Disable all terminal output for CI/CD integration
- 📈 **Event-driven**: Listen to test events for custom integrations
- 🖥️ **CLI Support**: Command-line interface for easy usage

## Installation

```bash
npm install stressy
```

## Quick Start

### Programmatic Usage

```javascript
import StressTester from "stressy";

const tester = new StressTester();

// Basic stress test
await tester.runStressTest({
  url: "https://api.example.com/users",
  requestsPerSecond: 100,
  totalRequests: 1000,
});

// POST request with dynamic data
await tester.runStressTest({
  url: "https://api.example.com/users",
  method: "POST",
  body: {
    name: "User {id}",
    email: "user{id}@example.com",
  },
  dynamicData: true,
  requestsPerSecond: 50,
  totalRequests: 500,
});

// Ramp-up test
await tester.runStressTest({
  baseURL: "https://api.example.com",
  endpoint: "/users",
  requestsPerSecond: 10,
  rampUp: [10, 50, 100, 200],
  duration: 60,
});
```

### CLI Usage

```bash
# Basic usage
npx stressy --url "https://api.example.com/users" --rps 100 --requests 1000

# With custom headers and body
npx stressy --url "https://api.example.com/users" --rps 50 --requests 500 \
  --method POST --headers '{"Authorization": "Bearer token"}' \
  --body '{"name": "Test User"}'

# Duration-based test
npx stressy --url "https://api.example.com/users" --rps 200 --duration 60

# Silent mode (no terminal output)
npx stressy --url "https://api.example.com/users" --rps 100 --requests 1000 --silent
```

## API Reference

### StressTester Class

#### Constructor Options

```javascript
const tester = new StressTester({
  baseURL: "https://api.example.com", // Base URL for all requests
  timeout: 5000, // Request timeout in milliseconds
  maxRetries: 3, // Maximum retry attempts
  reportInterval: 1000, // Progress reporting interval
  silent: false, // Disable terminal output
  reporter: new CustomReporter(), // Custom reporter instance
  dataGenerator: new CustomGenerator(), // Custom data generator
});
```

#### runStressTest Options

| Option              | Type            | Required | Description                    |
| ------------------- | --------------- | -------- | ------------------------------ |
| `url`               | string          | No\*     | Complete URL for requests      |
| `baseURL`           | string          | No\*     | Base URL (use with endpoint)   |
| `endpoint`          | string          | No\*     | API endpoint path              |
| `method`            | string          | No       | HTTP method (default: GET)     |
| `headers`           | object          | No       | HTTP headers                   |
| `body`              | object/function | No       | Request body                   |
| `dynamicData`       | boolean         | No       | Enable dynamic data generation |
| `requestsPerSecond` | number          | Yes      | Requests per second rate       |
| `totalRequests`     | number          | No       | Total requests to send         |
| `duration`          | number          | No       | Test duration in seconds       |
| `rampUp`            | number[]        | No       | RPS values for ramp-up testing |
| `timeout`           | number          | No       | Request timeout                |
| `maxRetries`        | number          | No       | Maximum retry attempts         |
| `silent`            | boolean         | No       | Disable terminal output        |

\*Either `url` or both `baseURL` and `endpoint` are required.

### Events

The StressTester extends EventEmitter and emits the following events:

- `testStart` - Emitted when test starts
- `progress` - Emitted during test execution
- `requestComplete` - Emitted for each completed request
- `stageComplete` - Emitted when ramp-up stage completes
- `testComplete` - Emitted when test completes
- `error` - Emitted when an error occurs

```javascript
tester.on("testComplete", (results) => {
  console.log(`Test completed: ${results.successRate}% success rate`);
});
```

## Dynamic Data Generation

Generate dynamic request bodies using template strings:

```javascript
await tester.runStressTest({
  url: "https://api.example.com/users",
  method: "POST",
  body: {
    id: "{id}", // Request ID
    name: "User {id}", // String interpolation
    email: "user{id}@example.com",
    age: "{randomNumber:100}", // Random number 0-100
    country: "USA",
  },
  dynamicData: true,
  requestsPerSecond: 10,
  totalRequests: 100,
});
```

## Reporters

### ConsoleReporter (Default)

Provides colored terminal output with progress bars.

### JSONReporter

Outputs structured JSON data for programmatic consumption.

```javascript
import { JSONReporter } from "stressy";

const tester = new StressTester({
  reporter: new JSONReporter(),
});
```

## CLI Options

| Option       | Alias | Type    | Description                 |
| ------------ | ----- | ------- | --------------------------- |
| `--url`      | `-u`  | string  | Target URL                  |
| `--requests` | `-r`  | number  | Total number of requests    |
| `--rps`      |       | number  | Requests per second         |
| `--duration` | `-d`  | number  | Test duration in seconds    |
| `--method`   | `-m`  | string  | HTTP method                 |
| `--headers`  |       | string  | Headers as JSON string      |
| `--body`     |       | string  | Request body as JSON string |
| `--silent`   | `-s`  | boolean | Silent mode                 |

## Testing

The project includes comprehensive test coverage using Vitest:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The test suite covers:

- ✅ **StressTester class** - All methods and configurations
- ✅ **DataGenerator** - Dynamic data generation and placeholders
- ✅ **Reporters** - ConsoleReporter and JSONReporter
- ✅ **Validators** - Configuration validation
- ✅ **Statistics** - Statistical calculations
- ✅ **CLI** - Command-line interface functionality

## Requirements

- Node.js >= 16.0.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ArturRushanyan/stressy.git
cd stressy

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run examples
npm run dev
```

## Author

ArthurRushanyan
