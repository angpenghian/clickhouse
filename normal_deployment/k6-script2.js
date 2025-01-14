import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 users
    { duration: '3m', target: 10 }, // Stay at 10 users for 3 minutes
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
};

export default function () {
  const url = 'http://localhost:8123/';

  // Randomly select the number of rows to insert (e.g., 1000 or 2000)
  const rowCounts = [1000, 2000];
  const rowCount = rowCounts[Math.floor(Math.random() * rowCounts.length)];

  let values = '';

  for (let i = 0; i < rowCount; i++) {
    // Generate unique identifiers for each row
    const timestamp = 'now64()';
    const traceId = `trace-id-${__VU}-${__ITER}-${i}`;
    const spanId = `span-id-${__VU}-${__ITER}-${i}`;
    const traceFlags = 1;
    const severityText = 'INFO';
    const severityNumber = 10;
    const serviceName = 'test-service';

    // Include 'thoughtworks' in 'Body' with a probability of 0.001%
    let bodyText = 'Test log body';
    if (Math.random() < 0.00001) { // 0.001% probability
      bodyText = 'Test log body with thoughtworks';
    }

    const resourceSchemaUrl = 'http://schema.url';
    const resourceAttributes = "map('key1', 'value1', 'key2', 'value2')";
    const scopeSchemaUrl = 'http://scope.url';
    const scopeName = 'test-scope';
    const scopeVersion = '1.0.0';
    const scopeAttributes = "map('key3', 'value3')";
    const logAttributes = "map('key4', 'value4')";

    // Build the VALUES string for the INSERT statement
    values += `(
      ${timestamp}, '${traceId}', '${spanId}', ${traceFlags}, '${severityText}', ${severityNumber},
      '${serviceName}', '${bodyText}', '${resourceSchemaUrl}',
      ${resourceAttributes}, '${scopeSchemaUrl}',
      '${scopeName}', '${scopeVersion}', ${scopeAttributes}, ${logAttributes}
    ),`;
  }

  // Remove the trailing comma from the VALUES string
  values = values.slice(0, -1);

  const payload = `
    INSERT INTO otel_logs (
      Timestamp, TraceId, SpanId, TraceFlags, SeverityText, SeverityNumber,
      ServiceName, Body, ResourceSchemaUrl, ResourceAttributes, ScopeSchemaUrl,
      ScopeName, ScopeVersion, ScopeAttributes, LogAttributes
    ) VALUES
      ${values}
  `;

  const params = {
    headers: { 'Content-Type': 'application/sql' },
  };

  const res = http.post(url, payload, params);

  if (res.status !== 200) {
    console.error(`Failed to insert: ${res.body}`);
  }

  sleep(1);
}
