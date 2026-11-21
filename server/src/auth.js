import "dotenv/config";
import jwt from "jsonwebtoken";

const secret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "mobix-local-development-secret");

if (!secret) {
  throw new Error("JWT_SECRET must be set in production");
}

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: "7d" });
}

function readToken(request) {
  const header = request.headers.authorization || "";
  return header.replace(/^Bearer\s+/i, "").trim();
}

export function authRequired(request, response, next) {
  const token = readToken(request);
  if (!token) {
    return response.status(401).json({ error: "Authentication required" });
  }
  try {
    request.auth = jwt.verify(token, secret);
    return next();
  } catch {
    return response.status(401).json({ error: "Your session has expired" });
  }
}

export function adminRequired(request, response, next) {
  return authRequired(request, response, () => {
    if (!["admin", "super_admin"].includes(request.auth.role)) {
      return response.status(403).json({ error: "Studio access is required" });
    }
    return next();
  });
}
