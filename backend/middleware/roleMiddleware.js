exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    //console.log("🔐 Checking roles:", req.user?.roles);
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};
