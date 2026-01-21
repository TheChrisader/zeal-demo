import { context, Context, trace } from '@opentelemetry/api';
import { Logger } from 'pino';
import { getLogger } from './logger.factory';
import { withTraceContext } from './otel-integration';

export interface RequestContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  method?: string;
  pathname?: string;
  userAgent?: string;
  ip?: string;
}

export const createChildLogger = (
  component: string,
  requestContext?: RequestContext,
): Logger => {
  const baseLogger = getLogger();
  const traceContext = withTraceContext({}, context.active());

  // Build the child logger context
  const childContext: Record<string, unknown> = {
    component,
    ...traceContext,
  };

  // Add request context if provided
  if (requestContext) {
    if (requestContext.requestId) childContext.requestId = requestContext.requestId;
    if (requestContext.userId) childContext.userId = requestContext.userId;
    if (requestContext.sessionId) childContext.sessionId = requestContext.sessionId;
    if (requestContext.method) childContext.method = requestContext.method;
    if (requestContext.pathname) childContext.pathname = requestContext.pathname;
    if (requestContext.userAgent) childContext.userAgent = requestContext.userAgent;
    if (requestContext.ip) childContext.ip = requestContext.ip;
  }

  return baseLogger.child(childContext);
};
