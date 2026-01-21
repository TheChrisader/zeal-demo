import { NodeSDK } from '@opentelemetry/sdk-node';
import { AlwaysOnSampler, ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
import { exporterStatus, metricReader, spanProcessor, traceExporter } from './exporters';
import { instrumentations, telemetryResource } from './sdk-config';
import { createLogger } from '../logger';

const logger = createLogger('opentelemetry');

// Configure sampler (10% in production, 100% in development)
const samplingRate = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '1.0');
const sampler = process.env.NODE_ENV === 'production'
  ? new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(samplingRate) })
  : new AlwaysOnSampler();

const sdk = new NodeSDK({
  resource: telemetryResource,
  traceExporter,
  spanProcessor,
  metricReader,
  instrumentations,
  sampler,
  autoDetectResources: true,
});

export function initializeOpenTelemetry(): void {
  sdk.start();

  if (process.env.NODE_ENV === 'development') {
    logger.debug(exporterStatus, 'Exporters configured');
  }

  // Only register process handlers in Node.js runtime
  if (typeof process !== 'undefined') {
    process.on('SIGTERM', async () => {
      await shutdownOpenTelemetry();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      await shutdownOpenTelemetry();
      process.exit(0);
    });
  }
  // OpenTelemetry initialized message will be logged by Pino in instrumentation.ts
}

export async function shutdownOpenTelemetry(): Promise<void> {
  await sdk.shutdown();
}
