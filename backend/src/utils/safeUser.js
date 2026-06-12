function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    role: user.role?.name ?? user.role,
  };
}

module.exports = {
  toSafeUser,
};
