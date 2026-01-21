import { context, Context, trace } from '@opentelemetry/api';

// Extract trace ID from current OpenTelemetry context
export function getTraceContext(ctx?: Context): { traceId?: string; spanId?: string } {
  const currentCtx = ctx || context.active();
  const currentSpan = trace.getSpan(currentCtx);

  if (!currentSpan) {
    return {};
  }

  const spanContext = currentSpan.spanContext();

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

// Mixin function to add trace context to log entries
export function withTraceContext(logObject: Record<string, unknown>, ctx?: Context): Record<string, unknown> {
  const traceContext = getTraceContext(ctx);
  return {
    ...logObject,
    ...traceContext,
  };
}

// Get trace ID for use in error responses or headers
export function getCurrentTraceId(): string | undefined {
  const currentSpan = trace.getSpan(context.active());
  if (!currentSpan) {
    return undefined;
  }
  return currentSpan.spanContext().traceId;
}
