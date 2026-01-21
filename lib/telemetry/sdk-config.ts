import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

export const telemetryResource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "zeal-news",
  [ATTR_SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || "1.0.0",
  "deployment.environment": process.env.NODE_ENV || "production",
  // Additional attributes for Grafana Cloud
  "service.namespace": "zeal-news-app",
  "service.instance.id": process.env.HOSTNAME || "localhost",
});

export const instrumentations = getNodeAutoInstrumentations({
  // Disable winston since we use Pino instead
  "@opentelemetry/instrumentation-winston": { enabled: false },
  // Configure specific instrumentations
  "@opentelemetry/instrumentation-http": {
    applyCustomAttributesOnSpan: (span) => {
      // Add custom attributes to HTTP spans
      span.setAttribute("custom.service", "zeal-news");
    },
  },
  // Disable certain instrumentations if needed
  // '@opentelemetry/instrumentation-express': { enabled: false },
});
