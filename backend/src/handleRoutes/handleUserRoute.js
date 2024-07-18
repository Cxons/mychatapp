const asynchandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { userTable } = require("../schemas/schema");
const { db } = require("../../db/connections/connection");
const { eq } = require("drizzle-orm");
const nodeMailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { MemoryCache } = require("memory-cache-node");
const crypto = require("crypto");
require("dotenv").config();
const SALT = process.env.SALT;

//function to handle user registration
const handleRegister = asynchandler(async (req, res) => {
  const { userName, email, password } = req.body;
  console.log("myUsername is", userName, email, password);
  if (!userName || !email || !password) {
    res.status(401);
    throw new Error("No optional field");
  } else {
    const existingEmail = await db
      .select({ email: userTable.email })
      .from(userTable)
      .where(eq(userTable.email, email));

    if (existingEmail.length != 0) {
      res.status(403);
      throw new Error("Email already exists");
    }
    const hashedPassword = bcrypt.hashSync(password, SALT);
    await db.insert(userTable).values({
      name: userName,
      email: email,
      password: hashedPassword,
    });
    const verificationCode = crypto.randomBytes(7).toString("hex");
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASS,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: "Verify your email",
      text: `Your verification Code is ${verificationCode}`,
    };
    console.log("the verification code", verificationCode);
    // transporter.sendMail(mailOptions, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //     res.status(401);
    //     throw new Error("error sending the email");
    //   }
    //   console.log(data, "the email was has been sent successfully");
    // });
    await db
      .update(userTable)
      .set({
        verificationCode: verificationCode,
      })
      .where(eq(userTable.email, email));
    res
      .status(200)
      .json({ message: "user registered successfully", status: 200 });
  }
});

//function to confirm the user verification code input
const confirmEmail = asynchandler(async (req, res) => {
  const { code } = req.body;
  const originalCode = await db
    .select()
    .from(userTable)
    .where(eq(code, userTable.verificationCode));
  console.log("orginal code", originalCode);
  if (originalCode.length === 0) {
    res.status(401);
    throw new Error("Sorry Code invalid");
  }
  res.status(200).json({ message: "confirmed, user can proceed" });
});

//function to handle user login
const handleLogin = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403);
    throw new Error("All fields are mandatory");
  }
  const existingEmail = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  console.log("the existing email", existingEmail);
  if (existingEmail.length == 0) {
    res.status(401);
    throw new Error("Email invalid");
  }
  const isPasswordCorrect = bcrypt.compareSync(
    password,
    existingEmail[0].password
  );
  if (isPasswordCorrect === false) {
    res.status(401);
    throw new Error("password incorrect");
  }
  console.log("check password", isPasswordCorrect);

  const jwtBody = { email: existingEmail[0].email };
  const accessToken = jwt.sign(jwtBody, process.env.COOKIE_TOKEN);
  res.cookie("acessToken", accessToken);
  res.cookie("userId", existingEmail[0].userId);
  res.status(200).json({
    message: "User signed in successfully",
    accessToken: accessToken,
    name: existingEmail[0].name,
    id: existingEmail[0].userId,
    status: 200,
  });
});

const handleprotectCurrentRoutes = asynchandler(async (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    res.status(401);
    throw new Error("No tokens found, user not allowed");
  }
  jwt.verify(accessToken, process.env.COOKIE_TOKEN, (err, data) => {
    if (err) {
      res.status(401);
      throw new Error("data tampered with...access denied");
    }
    res.status(200).json({ message: " User Allowed Access", data: data });
  });
});

const handleLogOut = asynchandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "User logged out" });
});

module.exports = {
  handleRegister,
  confirmEmail,
  handleLogin,
  handleprotectCurrentRoutes,
  handleLogOut,
};
