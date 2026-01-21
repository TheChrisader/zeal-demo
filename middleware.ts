// import { authMiddleware } from "./middlewares/auth.middleware";
import { corsMiddleware } from './middlewares/cors.middleware';
import { intlMiddleware } from './middlewares/intl.middleware';
import { jwtMiddleware } from './middlewares/jwt.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import { stackMiddlewares } from './middlewares/stack-middlewares';

const middlewares = [
  loggingMiddleware, // Add first to capture all requests
  corsMiddleware,
  jwtMiddleware,
  intlMiddleware,
];

export default stackMiddlewares(middlewares);
