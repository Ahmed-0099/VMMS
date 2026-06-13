const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");
const { signToken } = require("../utils/jwt");
const { comparePassword, hashPassword } = require("../utils/password");
const { toSafeUser } = require("../utils/safeUser");

const ALLOWED_ROLES = ["ADMIN", "TECHNICIAN", "DRIVER"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function normalizeRole(roleName) {
  return String(roleName ?? "").trim().toUpperCase();
}

function validateRegisterPayload(payload) {
  const name = String(payload.name ?? "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password ?? "");
  const roleName = normalizeRole(payload.roleName);

  if (!name) {
    throw createHttpError(400, "Name is required");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw createHttpError(400, "A valid email is required");
  }

  if (password.length < 6) {
    throw createHttpError(400, "Password must be at least 6 characters");
  }

  if (!ALLOWED_ROLES.includes(roleName)) {
    throw createHttpError(400, "A valid role is required");
  }

  return {
    name,
    email,
    password,
    roleName,
  };
}

function validateLoginPayload(payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password ?? "");

  if (!EMAIL_PATTERN.test(email)) {
    throw createHttpError(400, "A valid email is required");
  }

  if (!password) {
    throw createHttpError(400, "Password is required");
  }

  return {
    email,
    password,
  };
}

function validateProfilePayload(payload) {
  const name = String(payload.name ?? "").trim();

  if (!name) {
    throw createHttpError(400, "Name is required");
  }

  if (name.length > 80) {
    throw createHttpError(400, "Name must be 80 characters or less");
  }

  return {
    name,
  };
}

function validatePasswordPayload(payload) {
  const currentPassword = String(payload.currentPassword ?? "");
  const newPassword = String(payload.newPassword ?? "");

  if (!currentPassword) {
    throw createHttpError(400, "Current password is required");
  }

  if (newPassword.length < 6) {
    throw createHttpError(400, "New password must be at least 6 characters");
  }

  return {
    currentPassword,
    newPassword,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, roleName } = validateRegisterPayload(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createHttpError(409, "Email is already registered");
    }

    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw createHttpError(400, "Selected role does not exist");
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: role.id,
      },
      include: { role: true },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: toSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = validateLoginPayload(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw createHttpError(401, "Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw createHttpError(403, "User account is inactive");
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);

    if (!passwordMatches) {
      throw createHttpError(401, "Invalid email or password");
    }

    res.json({
      message: "Login successful",
      token: signToken(user),
      user: toSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    res.json({
      user: toSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name } = validateProfilePayload(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name },
      include: { role: true },
    });

    res.json({
      message: "Profile updated successfully",
      user: toSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = validatePasswordPayload(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    const passwordMatches = await comparePassword(currentPassword, user.passwordHash);

    if (!passwordMatches) {
      throw createHttpError(401, "Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

function logout(req, res) {
  res.json({
    message: "Logout successful",
  });
}

module.exports = {
  register,
  login,
  me,
  updateProfile,
  updatePassword,
  logout,
};
