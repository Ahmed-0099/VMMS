const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");
const { verifyToken } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Authentication token is required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user || user.status !== "ACTIVE") {
      throw createHttpError(401, "User account is not active");
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(createHttpError(401, "Invalid or expired authentication token"));
      return;
    }

    next(error);
  }
}

module.exports = {
  requireAuth,
};
