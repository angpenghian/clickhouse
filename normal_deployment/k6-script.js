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
  const payload = `
    INSERT INTO default.otel_logs (
      Timestamp, TraceId, SpanId, TraceFlags, SeverityText, SeverityNumber,
      ServiceName, Body, ResourceSchemaUrl, ResourceAttributes, ScopeSchemaUrl,
      ScopeName, ScopeVersion, ScopeAttributes, LogAttributes
    ) VALUES (
      now64(), 'trace-id-example', 'span-id-example', 1, 'INFO', 10,
      'test-service', 'Test log body', 'http://schema.url', 
      map('key1', 'value1', 'key2', 'value2'), 'http://scope.url',
      'test-scope', '1.0.0', map('key3', 'value3'), map('key4', 'value4')
    )
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
