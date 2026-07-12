import pino from 'pino';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: ['req.headers.authorization', 'req.body.password'],
});

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate or read request-id
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  // Bind request-id to logging context
  const requestLogger = logger.child({ requestId });
  (req as any).log = requestLogger;

  // Log incoming request
  requestLogger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
  }, 'Incoming request');

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    requestLogger.info({
      statusCode: res.statusCode,
      durationMs: duration
    }, 'Request completed');
  });

  next();
};
export default logger;
