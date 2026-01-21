// Paths to redact from logs (follows fast-redact syntax)
export const redactionRules = [
  // Passwords and tokens
  'password',
  'password_hash',
  'token',
  'accessToken',
  'refreshToken',
  'sessionToken',
  'apiKey',
  'secret',
  '*password',
  '*token',
  '*secret',

  // PII
  'email',
  'phone',
  'ssn',

  // Headers
  'headers.authorization',
  'headers.cookie',
  'req.headers.authorization',
  'req.headers.cookie',

  // Request body
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.token',

  // User sensitive fields
  'user.password_hash',
  'user.sessionToken',
];
