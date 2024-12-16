// import { authMiddleware } from "./middlewares/auth.middleware";
import { corsMiddleware } from "./middlewares/cors.middleware";
import { intlMiddleware } from "./middlewares/intl.middleware";
import { jwtMiddleware } from "./middlewares/jwt.middleware";
import { stackMiddlewares } from "./middlewares/stack-middlewares";

const middlewares = [corsMiddleware, jwtMiddleware, intlMiddleware];

export default stackMiddlewares(middlewares);
