const requireAuth = require("@clerk/express");

const conditionalAuth = async (req, res, next) => {
  try {
    const { type } = req.query;
    if (type === "downloads") {
      return next();
    }

    return requireAuth()(req, res, next);
  } catch (error) {
    return res.status(404).message("User is not authorized");
  }
};

module.exports = conditionalAuth;
