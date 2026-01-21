import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import type { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { createLogger } from '../logger';

const logger = createLogger('otel-exporters');

// ============================================
// GRAFANA CLOUD OTLP HTTP EXPORTERS
// ============================================

// Parse headers from OTEL_EXPORTER_OTLP_HEADERS format
// Expected format: "Authorization=Bearer token, X-Custom-Header=value"
function parseHeaders(headersEnv: string | undefined): Record<string, string> {
  if (!headersEnv) return {};
  const headers: Record<string, string> = {};
  headersEnv.split(',').forEach(header => {
    const [key, ...valueParts] = header.split('=');
    if (key && valueParts.length > 0) {
      headers[key.trim()] = valueParts.join('=').trim();
    }
  });
  return headers;
}

// Use single endpoint for all signals
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const otlpHeaders = parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS);

// Helper to log export results
function logExportResult(signalType: string, result: ExportResult): void {
  if (result.code === ExportResultCode.FAILED) {
    logger.error({ signalType, error: result.error }, `Failed to export ${signalType} to Grafana Cloud`);
  } else if (process.env.NODE_ENV === 'development') {
    logger.debug({ signalType }, `Successfully exported ${signalType} to Grafana Cloud`);
  }
}

// Trace Exporter with error logging
class TraceExporterWithLogging extends OTLPTraceExporter {
  export(items: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    return super.export(items, (result) => {
      logExportResult('traces', result);
      resultCallback(result);
    });
  }
}

// Append the signal-specific path since the exporter uses the URL as-is
const otlpTracesUrl = otlpEndpoint ? `${otlpEndpoint}/v1/traces` : undefined;
const otlpMetricsUrl = otlpEndpoint ? `${otlpEndpoint}/v1/metrics` : undefined;

const otlpTraceExporter = otlpTracesUrl
  ? new TraceExporterWithLogging({
      url: otlpTracesUrl,
      headers: otlpHeaders,
      compression: CompressionAlgorithm.GZIP,
    })
  : undefined;

export const traceExporter = otlpTraceExporter;

export const spanProcessor = otlpTraceExporter
  ? new BatchSpanProcessor(otlpTraceExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000,
      exportTimeoutMillis: 30000,
    })
  : undefined;

// Metrics Exporter with error logging
class MetricExporterWithLogging extends OTLPMetricExporter {
  export(items: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
    return super.export(items, (result) => {
      logExportResult('metrics', result);
      resultCallback(result);
    });
  }
}

const otlpMetricExporter = otlpMetricsUrl
  ? new MetricExporterWithLogging({
      url: otlpMetricsUrl,
      headers: otlpHeaders,
      compression: CompressionAlgorithm.GZIP,
    })
  : undefined;

export const metricReader = otlpMetricExporter
  ? new PeriodicExportingMetricReader({
      exporter: otlpMetricExporter,
      exportIntervalMillis: 60000,
      exportTimeoutMillis: 30000,
    })
  : undefined;

// Log Exporter - basic provider for now (OTLP logs can be added later if needed)
export const logExporter = undefined;
export const loggerProvider = new LoggerProvider();

// For debugging
export const exporterStatus = {
  tracesEnabled: !!otlpTraceExporter,
  metricsEnabled: !!otlpMetricExporter,
  logsEnabled: false,
  endpoint: otlpEndpoint || 'none',
};
