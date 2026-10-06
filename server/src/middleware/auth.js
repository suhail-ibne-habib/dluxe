let fromNodeHeaders;

async function headersFrom(req) {
  if (!fromNodeHeaders) {
    ({ fromNodeHeaders } = await import("better-auth/node"));
  }
  return fromNodeHeaders(req.headers);
}

function attachSession(auth) {
  return async function attachSession(req, res, next) {
    try {
      const session = await auth.api.getSession({ headers: await headersFrom(req) });
      if (session?.user) req.authUser = session.user;
    } catch (error) {
      console.error("Session lookup failed:", error.message);
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.authUser || req.authUser.role !== "admin") {
    return res.status(401).json({ message: "Admin session required" });
  }
  return next();
}

function requireAdminOn(methods) {
  const allowed = new Set(methods);
  return function requireAdminOnMethods(req, res, next) {
    if (!allowed.has(req.method)) return next();
    return requireAdmin(req, res, next);
  };
}

module.exports = { attachSession, requireAdmin, requireAdminOn };
