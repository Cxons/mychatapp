const express = require("express");
const userRouter = express.Router();
const {
  handleRegister,
  handleEmailVerification,
  confirmEmail,
  handleLogin,
  handleprotectCurrentRoutes,
  handleLogOut,
  handlegetSomething,
} = require("../handleRoutes/handleUserRoute");

userRouter.post("/register", handleRegister);
userRouter.route("/verifyEmail").post(confirmEmail);
userRouter.post("/login", handleLogin);
userRouter.post("/protected", handleprotectCurrentRoutes);
userRouter.post("/logout", handleLogOut);

module.exports = userRouter;
