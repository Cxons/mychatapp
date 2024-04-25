const express = require("express");
const chatRouter = express.Router();
const {
  handleStartSingleChat,
  handleStartGroupChat,
  getAllChats,
  getAllContacts,
  inviteContacts,
  getSpecificChat,
} = require("../handleRoutes/handleUserChat");

chatRouter.post("/startChat", handleStartSingleChat);
chatRouter.post("/startGroupChat", handleStartGroupChat);
chatRouter.get("/getChats", getAllContacts);
chatRouter.post("/invite", inviteContacts);
chatRouter.post("/getSingleChat", getSpecificChat);

module.exports = chatRouter;
