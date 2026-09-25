import { verifyToken } from "../utils/authUtils.js";

export const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.trim().split(/\s+/) || [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateToken;
